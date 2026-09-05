import type { GetServerSideProps } from "next";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import type { Language } from "@/lib/languages-api";

export const getServerSideProps: GetServerSideProps<{
  editingLanguageId: number | null;
  initialLanguage: Language | null;
}> = async ({ params, req, res }) => {
  res.setHeader("Cache-Control", "private, no-store");
  const id = params?.id;
  if (id === undefined) {
    return { props: { editingLanguageId: null, initialLanguage: null } };
  }
  if (typeof id !== "string" || !/^[1-9]\d*$/.test(id)) {
    return { notFound: true };
  }
  const editingLanguageId = Number(id);
  if (!Number.isSafeInteger(editingLanguageId)) {
    return { notFound: true };
  }

  const token = req.cookies.lms_access_token;
  const loginRedirect = {
    redirect: { destination: "/login", permanent: false as const },
  };
  if (!token) return loginRedirect;

  try {
    const { data } = await api.get<Language>(
      `/languages/${editingLanguageId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return { props: { editingLanguageId, initialLanguage: data } };
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) return loginRedirect;
      if (error.response?.status === 403 || error.response?.status === 404) {
        return { notFound: true };
      }
    }
    throw error;
  }
};
