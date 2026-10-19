const KUNCI = "catatan-keuangan";

const form = document.querySelector("#form-transaksi");
const inputNama = document.querySelector("#nama");
const inputJumlah = document.querySelector("#jumlah");
const pilihTipe = document.querySelector("#tipe");
const pilihKategori = document.querySelector("#kategori");
const pilihFilter = document.querySelector("#filter");
const pesan = document.querySelector("#pesan");
const daftar = document.querySelector("#daftar");
const kosong = document.querySelector("#kosong");

let state = {
  transaksi: muatData(),
  filter: "semua",
};

function transaksiValid(t) {
  return (
    t !== null &&
    typeof t === "object" &&
    typeof t.id === "number" &&
    typeof t.nama === "string" && t.nama !== "" &&
    typeof t.jumlah === "number" && t.jumlah > 0 &&
    (t.tipe === "masuk" || t.tipe === "keluar")
  );
}

function muatData() {
  try {
    const mentah = localStorage.getItem(KUNCI);
    if (mentah === null) return [];
    const data = JSON.parse(mentah);
    return Array.isArray(data) ? data.filter(transaksiValid) : [];
  } catch (error) {
    return [];
  }
}

function simpanData(data) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(data.transaksi));
  } catch (error) {
  }
}

const rupiah = (angka) => `Rp ${angka.toLocaleString("id-ID")}`;

function hitungTotal(daftarTransaksi, tipe) {
  return daftarTransaksi
    .filter((t) => t.tipe === tipe)
    .reduce((jumlah, t) => jumlah + t.jumlah, 0);
}

function tambahTransaksi(item) {
  if (item.nama === "") return "Keterangan tidak boleh kosong.";
  if (Number.isNaN(item.jumlah) || item.jumlah <= 0) return "Jumlah harus angka lebih dari 0.";
  if (state.transaksi.some((t) => t.id === item.id)) return "Transaksi ini sudah ada.";

  state.transaksi.push(item);
  simpanData(state);
  render(state);
  return "";
}

function render(data) {
  const masuk = hitungTotal(data.transaksi, "masuk");
  const keluar = hitungTotal(data.transaksi, "keluar");

  document.querySelector("#total-masuk").textContent = rupiah(masuk);
  document.querySelector("#total-keluar").textContent = rupiah(keluar);
  document.querySelector("#saldo").textContent = rupiah(masuk - keluar);

  const tampil = data.transaksi.filter(
    (t) => data.filter === "semua" || t.tipe === data.filter
  );

  daftar.innerHTML = "";
  kosong.hidden = tampil.length > 0;

  for (const t of [...tampil].reverse()) {
    const li = document.createElement("li");
    li.className = "item";

    const info = document.createElement("div");
    info.className = "info";

    const nama = document.createElement("div");
    nama.className = "nama";
    nama.textContent = t.nama;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${t.kategori} · ${t.tanggal}`;

    info.append(nama, meta);

    const nominal = document.createElement("span");
    nominal.className = `nominal ${t.tipe}`;
    nominal.textContent = `${t.tipe === "masuk" ? "+" : "-"}${rupiah(t.jumlah)}`;

    const hapus = document.createElement("button");
    hapus.type = "button";
    hapus.className = "hapus";
    hapus.dataset.id = t.id;
    hapus.textContent = "Hapus";
    hapus.setAttribute("aria-label", `Hapus ${t.nama}`);

    li.append(info, nominal, hapus);
    daftar.appendChild(li);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const item = {
    id: Date.now(),
    nama: inputNama.value.trim(),
    jumlah: Number(inputJumlah.value),
    tipe: pilihTipe.value,
    kategori: pilihKategori.value,
    tanggal: new Date().toLocaleDateString("id-ID"),
  };

  const galat = tambahTransaksi(item);
  pesan.textContent = galat;

  if (galat === "") {
    form.reset();
    inputNama.focus();
  }
});

pilihFilter.addEventListener("change", () => {
  state.filter = pilihFilter.value;
  render(state);
});

daftar.addEventListener("click", (event) => {
  const tombol = event.target.closest(".hapus");
  if (!tombol) return;

  const id = Number(tombol.dataset.id);
  state.transaksi = state.transaksi.filter((t) => t.id !== id);
  simpanData(state);
  render(state);
});

render(state);