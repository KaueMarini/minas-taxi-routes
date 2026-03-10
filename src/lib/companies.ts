export interface Company {
  code: string;
  name: string;
  cnpj: string;
}

const STORAGE_KEY = "minas-taxi-companies";

const DEFAULT_COMPANIES: Company[] = [
  { code: "6016", name: "ADRA MINAS", cnpj: "16.524.054/0002-77" },
  { code: "301", name: "BIO - RAD LABORATÓRIOS BRASIL LTDA", cnpj: "03.188.198/0001-77" },
  { code: "6010", name: "CLAMPER INDUSTRIA E COMERCIO S.A.", cnpj: "66.429.895/0001-92" },
  { code: "291", name: "CSN", cnpj: "08.902.291/0001-15" },
  { code: "284", name: "DELP ENGENHARIA MECANICA S.A", cnpj: "17.161.936/0008-73" },
  { code: "215", name: "DIAMED LATINO AMERICA S/A", cnpj: "71.015.853/0001-45" },
  { code: "287", name: "CNF - GOL AEROPORTO - VRG LINHAS AEREAS", cnpj: "07.575.651/0030-93" },
  { code: "285", name: "CNF - GOL HANGAR - VRG LINHAS AEREAS", cnpj: "07.575.651/0036-89" },
  { code: "320", name: "INSTITUTO HERMES PARDINI S/A", cnpj: "19.378.769/0001-76" },
  { code: "6017", name: "TECNOKOR / KOCH", cnpj: "02.572.696/0001-56" },
  { code: "296", name: "KOMATSU", cnpj: "02.336.124/0008-44" },
  { code: "226", name: "LABTEST", cnpj: "16.516.296/0001-38" },
  { code: "1201", name: "LIASA", cnpj: "17.221.771/0011-83" },
  { code: "1005", name: "COOPERATIVA MINAS TAXI", cnpj: "04.925.740/0001-90" },
  { code: "225", name: "SIMPLEX EQUIPAMENTOS LTDA", cnpj: "21.470.224/0001-37" },
  { code: "1011", name: "SUPORTE INFORMATICA", cnpj: "32.592.616/0001-95" },
  { code: "1004", name: "TAP TRANSPORTES AEREOS PORTUGUESES SA", cnpj: "33.136.896/0009-47" },
  { code: "228", name: "TOTAL LINHAS AEREAS", cnpj: "32.068.363/0002-36" },
  { code: "390", name: "VMI SISTEMAS DE SEGURANÇA LTDA", cnpj: "05.293.074/0001-87" },
];

export function loadCompanies(): Company[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Company[];
      // Merge: keep defaults + any custom ones
      const cnpjSet = new Set(parsed.map((c) => c.cnpj));
      const merged = [...parsed];
      for (const def of DEFAULT_COMPANIES) {
        if (!cnpjSet.has(def.cnpj)) merged.push(def);
      }
      return merged.sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch {}
  return [...DEFAULT_COMPANIES].sort((a, b) => a.name.localeCompare(b.name));
}

export function saveCompanies(companies: Company[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

export function addCompany(companies: Company[], company: Company): Company[] {
  const updated = [...companies, company].sort((a, b) => a.name.localeCompare(b.name));
  saveCompanies(updated);
  return updated;
}
