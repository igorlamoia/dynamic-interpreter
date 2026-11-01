import "./_theme";
import { Pagination } from "@ts-compilator-for-java/ide";

const noop = () => {};

export const Default = () => (
  <div className="w-full max-w-3xl p-6">
    <Pagination page={2} totalPages={5} onPageChange={noop} totalItems={47} pageSize={10} />
  </div>
);

export const ManyPages = () => (
  <div className="w-full max-w-3xl p-6">
    <Pagination page={7} totalPages={18} onPageChange={noop} totalItems={176} pageSize={10} />
  </div>
);

export const FirstPage = () => (
  <div className="w-full max-w-3xl p-6">
    <Pagination page={1} totalPages={3} onPageChange={noop} totalItems={24} pageSize={10} />
  </div>
);

export const TotalOnly = () => (
  <div className="w-full max-w-3xl p-6">
    <Pagination page={1} totalPages={1} onPageChange={noop} totalItems={6} />
  </div>
);
