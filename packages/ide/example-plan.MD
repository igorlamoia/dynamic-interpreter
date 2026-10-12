let narutoQuerConversar = true;
let erenQuerOuvir = false;
let erenQuerDestruirTudo = true;
let mikasaAmaEren = true;

if (narutoQuerConversar && erenQuerOuvir) {
console.log("Naruto venceu com o poder da amizade!");
}

if (narutoQuerConversar && !erenQuerOuvir) {
console.log("Naruto: Você já ouviu falar da minha infância?");
}

if (pacienciaDoEren > 5 && narutoQuerConversar) {
console.log("Eren começou a reconsiderar suas escolhas.");
}

if (pacienciaDoEren <= 5 && erenQuerDestruirTudo) {
console.log("Eren: TATAKAE! TATAKAE!");
}

if (mikasaAmaEren && pacienciaDaMikasa > 5) {
console.log("Mikasa: Eren, por favor, pare!");
}

if (pacienciaDaMikasa < 5 || !mikasaAmaEren) {
console.log("Mikasa pegou a espada. Acabou o diálogo!");
}
