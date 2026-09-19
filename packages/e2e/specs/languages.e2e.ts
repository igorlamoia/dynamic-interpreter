import { expect, test } from "../fixtures";

/**
 * A gestão do acervo próprio em `/languages`: duplicar, excluir e publicar na
 * comunidade. O custom-language.e2e.ts cobre o caminho de entrada (importar do
 * catálogo e ativar); as três ações do rodapé do card (language-card.tsx) não
 * eram exercitadas por nada.
 */

test("duplicar uma linguagem deixa as duas no acervo", async ({
  api,
  student,
  loginAs,
  page,
}) => {
  const original = await api.createLanguage(student.token);

  await loginAs(student.token);
  await page.goto("/languages");

  // `exact` importa deste ponto em diante: assim que a cópia existir, o nome da
  // original vira prefixo do nome dela e um match por substring pegaria as duas.
  const tituloOriginal = page.getByRole("heading", {
    name: original.name,
    exact: true,
  });
  await expect(tituloOriginal).toBeVisible();

  await page
    .getByRole("button", { name: `Duplicar ${original.name}`, exact: true })
    .click();

  // `clone_language` sempre sufixa o nome com " (cópia)"
  // (backend/app/modules/languages/service.py:270).
  const nomeDaCopia = `${original.name} (cópia)`;
  await expect(page.locator("#toast-success")).toContainText(
    `"${original.name}" duplicada como "${nomeDaCopia}".`,
  );

  // O toast é só a mensagem da mutation. O que prova a duplicação é a original
  // continuar lá ao lado da cópia — e continuar assim depois do reload, sem o
  // cache do react-query no caminho.
  await page.reload();
  await expect(tituloOriginal).toBeVisible();
  await expect(
    page.getByRole("heading", { name: nomeDaCopia, exact: true }),
  ).toBeVisible();

  const doBackend = await api.myLanguages(student.token);
  expect(doBackend.map((l) => l.name).sort()).toEqual(
    [original.name, nomeDaCopia].sort(),
  );
});

test("excluir uma linguagem pede confirmacao e some com ela", async ({
  api,
  student,
  loginAs,
  page,
}) => {
  const alvo = await api.createLanguage(student.token, "linguagem-a-excluir");
  const sobrevivente = await api.createLanguage(student.token, "linguagem-fica");

  await loginAs(student.token);
  await page.goto("/languages");
  await expect(page.getByRole("heading", { name: alvo.name })).toBeVisible();

  // A exclusão passa por `window.confirm` (languages-view.tsx:handleDelete).
  // Sem um handler, o Playwright dispensa o diálogo automaticamente e nada é
  // excluído — então o primeiro clique testa justamente o cancelamento.
  page.once("dialog", (dialog) => {
    expect(dialog.message()).toContain(alvo.name);
    return dialog.dismiss();
  });
  await page.getByRole("button", { name: `Excluir ${alvo.name}` }).click();
  await expect(page.getByRole("heading", { name: alvo.name })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: `Excluir ${alvo.name}` }).click();

  await expect(page.locator("#toast-success")).toContainText(
    `"${alvo.name}" excluída.`,
  );
  await expect(page.getByRole("heading", { name: alvo.name })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("heading", { name: alvo.name })).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: sobrevivente.name }),
  ).toBeVisible();
});

test("usuario da comunidade publica e despublica sua linguagem no acervo", async ({
  api,
  community,
  student,
  loginAs,
  page,
}) => {
  const minha = await api.createLanguage(community.token, "linguagem-publicavel");

  await loginAs(community.token);
  await page.goto("/languages");

  // Antes de publicar, ninguém mais enxerga a linguagem no catálogo.
  const catalogoAntes = await api.communityLanguages(student.token);
  expect(catalogoAntes.map((l) => l.name)).not.toContain(minha.name);

  await page.getByRole("button", { name: `Publicar ${minha.name}` }).click();
  await expect(page.locator("#toast-success")).toContainText(
    `"${minha.name}" agora está no acervo da comunidade.`,
  );

  // A prova da publicação não é o toast: é outra conta passar a ver a
  // linguagem no catálogo comunitário.
  const catalogoDepois = await api.communityLanguages(student.token);
  expect(catalogoDepois.map((l) => l.name)).toContain(minha.name);

  // O botão troca de rótulo assim que a publicação muda: é por ele que a
  // despublicação acontece.
  await page
    .getByRole("button", { name: `Despublicar ${minha.name}` })
    .click();
  await expect(page.locator("#toast-success")).toContainText(
    `"${minha.name}" foi removida do acervo da comunidade.`,
  );

  const catalogoFinal = await api.communityLanguages(student.token);
  expect(catalogoFinal.map((l) => l.name)).not.toContain(minha.name);
});

test("o botao de publicar nao existe para quem nao e da comunidade", async ({
  api,
  student,
  loginAs,
  page,
}) => {
  // `canPublish={isCommunity}` (languages-view.tsx) — um aluno não deve poder
  // empurrar linguagem para o acervo público.
  const minha = await api.createLanguage(student.token);

  await loginAs(student.token);
  await page.goto("/languages");

  await expect(page.getByRole("heading", { name: minha.name })).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Publicar ${minha.name}` }),
  ).toHaveCount(0);
});
