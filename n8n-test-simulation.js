// Simulação local do fluxo n8n atualizado, usando o pin data fornecido
// e respostas reais do OpenCage (salvas em /tmp/dest.json, /tmp/p1.json, /tmp/p2.json)
const fs = require("fs");

// ===== Pin data (Webhook) =====
const webhookItem = {
  body: {
    trip: {
      company: "17.161.936/0008-73",
      requester: "ANA BEATRIZ",
      requesterPhone: "",
      scheduledDate: "06/08/2026",
      arrivalTime: "08:00",
      returnTime: "23:00",
      horario_retorno: "23:00",
      departureTime: "",
      estimatedTravelTime: "",
      vehicleNumber: 1,
      routeName: "Carro 1",
      payment: "Voucher",
      extra1: "CONVENCIONAL",
      serviceTime: "21:20",
      passengers: [
        {
          passengerId: 1, sequence: 1, name: "Hudson Leonardo Alves Martins",
          phone: "31999999926", passenger_cost_center: "1.07001.03.003",
          re: "87632121", serviceTime: "21:20",
          pickup: { address: "Rua Paraná, 659, Célvia, Vespasiano" }
        },
        {
          passengerId: 2, sequence: 3, name: "Max Gomes Maria",
          phone: "31999999926", passenger_cost_center: "1.07001.03.003",
          re: "8763232121", serviceTime: "21:20",
          pickup: { address: "Rua Mato Grosso, 573, Célvia, Vespasiano" }
        }
      ],
      destinations: [
        { passengerId: 1, sequence: 2, location: { address: "Avenida das Nações, 3785, Distrito Industrial, Vespasiano" } },
        { passengerId: 2, sequence: 4, location: { address: "Avenida das Nações, 3785, Distrito Industrial, Vespasiano" } }
      ]
    },
    webhookUrl: "https://n8n.srv1497518.hstgr.cloud/webhook/apiTaxi",
    executionMode: "production"
  },
  webhookUrl: "https://n8n.srv1497518.hstgr.cloud/webhook/apiTaxi",
  executionMode: "production"
};

const webhook = webhookItem.body;
const tripInfo = webhook.trip;

// ===== "Code in JavaScript1" - limpa endereços e monta itemsToGeocode =====
function limparEndereco(endereco) {
  if (!endereco) return "";
  let limpo = endereco;
  limpo = limpo.replace(/^\d{8}[,\s-]+/, "");
  limpo = limpo.replace(/Cidade:/gi, "");
  limpo = limpo.replace(/UF:/gi, "");
  limpo = limpo.replace(/Estado:/gi, "");
  limpo = limpo.replace(/CEP:/gi, "");
  limpo = limpo.replace(/Bairro:/gi, "");
  limpo = limpo.replace(/RUA - /gi, "");
  limpo = limpo.replace(/AVENIDA - /gi, "");
  limpo = limpo.replace(/ - Número:\s*/gi, ", ");
  limpo = limpo.replace(/ - BAIRRO /gi, ", ");
  limpo = limpo.replace(/\s+/g, " ").trim();
  if (!limpo.toLowerCase().includes("brasil")) {
    limpo = limpo + ", Minas Gerais, Brasil";
  }
  return limpo.trim();
}

const itemsToGeocode = [];
const destinoAddress = tripInfo.destinations[0].location.address;
itemsToGeocode.push({ type: "destino", id: 0, address: limparEndereco(destinoAddress), original_address: destinoAddress });

tripInfo.passengers.forEach((u, index) => {
  const addressRaw = u.pickup.address;
  itemsToGeocode.push({
    type: "passageiro",
    id: u.passengerId || String(index + 1),
    name: u.name,
    phone: u.phone,
    costCenter: u.passenger_cost_center || "",
    original_address: addressRaw,
    address: limparEndereco(addressRaw)
  });
});

console.log("=== Itens para geocodificar (saída do 'Code in JavaScript1') ===");
console.log(JSON.stringify(itemsToGeocode, null, 2));

// ===== Resultados reais do OpenCage =====
const geocodeResults = [
  { json: JSON.parse(fs.readFileSync("/tmp/dest.json", "utf-8")) },
  { json: JSON.parse(fs.readFileSync("/tmp/p1.json", "utf-8")) },
  { json: JSON.parse(fs.readFileSync("/tmp/p2.json", "utf-8")) },
];

// ===== "Code in JavaScript" (ida) - lógica atualizada =====
function extrairComponentes(item) {
  const result = item.json.results && item.json.results[0] ? item.json.results[0] : null;
  const geometry = result ? result.geometry : { lat: "", lng: "" };
  const components = result ? (result.components || {}) : {};
  return {
    lat: (geometry.lat || "").toString(),
    lng: (geometry.lng || "").toString(),
    neighborhood: components.neighbourhood || components.suburb || components.neighborhood || "",
    city: components.city || components.town || components.municipality || components.village || "",
    state: components.state_code || components.state || "",
    postal_code: components.postcode || ""
  };
}

let destInfo = { lat: "", lng: "", neighborhood: "", city: "", state: "", postal_code: "" };
const userInfo = {};

geocodeResults.forEach((item, index) => {
  const info = extrairComponentes(item);
  if (index === 0) {
    destInfo = info;
  } else {
    const passageiroId = itemsToGeocode.filter(p => p.type === "passageiro")[index - 1]?.id;
    if (passageiroId) userInfo[passageiroId] = info;
  }
});

// pickup_time
let pickupTimeUnix = Math.floor(Date.now() / 1000);
try {
  if (tripInfo.scheduledDate) {
    let timeString = "";
    if (tripInfo.passengers && tripInfo.passengers.length > 0) {
      timeString = tripInfo.passengers[0].serviceTime;
    }
    if (!timeString) timeString = tripInfo.departureTime || tripInfo.arrivalTime || "00:00";
    let [d, m, y] = tripInfo.scheduledDate.split('/');
    let [h, min] = timeString.split(':');
    if (!y) y = new Date().getFullYear().toString();
    else if (y.length === 2) y = "20" + y;
    const pad = (num) => String(num).padStart(2, '0');
    const dataIsoBRT = `${y}-${pad(m)}-${pad(d)}T${pad(h || 0)}:${pad(min || 0)}:00-03:00`;
    const dateObj = new Date(dataIsoBRT);
    if (!isNaN(dateObj.getTime())) pickupTimeUnix = Math.floor(dateObj.getTime() / 1000);
  }
} catch (e) { console.log("Erro na data: ", e); }

const finalUsers = itemsToGeocode.filter(p => p.type === "passageiro").map((u, index) => {
  const info = userInfo[u.id] || { lat: "", lng: "", neighborhood: "", city: "", state: "", postal_code: "" };
  const passageiroOriginal = tripInfo.passengers.find(p => p.name === u.name) || tripInfo.passengers[index] || {};
  return {
    id: u.id,
    sequence: (index * 2) + 1,
    name: u.name,
    phone: u.phone.replace(/\D/g, ""),
    passenger_re: passageiroOriginal.re || "",
    passenger_cost_center: u.costCenter,
    pickup: {
      address: u.original_address,
      neighborhood: info.neighborhood,
      city: info.city,
      state: info.state,
      postal_code: info.postal_code,
      lat: info.lat,
      lng: info.lng
    }
  };
});

const finalDestinations = finalUsers.map((u, index) => ({
  passengerId: u.id,
  sequence: (index * 2) + 2,
  location: {
    address: tripInfo.destinations[0].location.address || "",
    neighborhood: destInfo.neighborhood,
    city: destInfo.city,
    state: destInfo.state,
    postal_code: destInfo.postal_code,
    reference: "",
    lat: destInfo.lat,
    lng: destInfo.lng
  }
}));

const finalPayloadIda = {
  partner: "322",
  user: tripInfo.company.replace(/\D/g, "") || "CNPJ_VAZIO",
  password: "0104",
  request_id: `REQ-${Date.now()}`,
  pickup_time: pickupTimeUnix.toString(),
  distance: "0",
  stopped_time: "0",
  category: "taxi",
  passengers_no: finalUsers.length,
  send_sms: 1,
  suitcases_no: 0,
  requester_name: `${tripInfo.requester || ''}`,
  extra1: tripInfo.extra1,
  extra2: tripInfo.requester,
  payment_type: tripInfo.payment,
  users: finalUsers,
  destinations: finalDestinations
};

console.log("\n=== JSON FINAL DE IDA (enviado para /rideCreate) ===");
console.log(JSON.stringify(finalPayloadIda, null, 2));

// ===== "Monta Json Volta" - lógica atualizada =====
const timeString = tripInfo.returnTime || tripInfo.horario_retorno || "";

if (!timeString || timeString.trim() === "" || timeString === "00:00") {
  console.log("\n=== VOLTA ABORTADA (sem horário de retorno) ===");
} else {
  let pickupTimeUnixVolta = Math.floor(Date.now() / 1000);
  try {
    if (tripInfo.scheduledDate) {
      let [d, m, y] = tripInfo.scheduledDate.split('/');
      let [h, min] = timeString.split(':');
      if (!y) y = new Date().getFullYear().toString();
      else if (y.length === 2) y = "20" + y;
      const pad = (num) => String(num).padStart(2, '0');
      const dataIsoBRT = `${y}-${pad(m)}-${pad(d)}T${pad(h || 0)}:${pad(min || 0)}:00-03:00`;
      const dateObj = new Date(dataIsoBRT);
      if (!isNaN(dateObj.getTime())) pickupTimeUnixVolta = Math.floor(dateObj.getTime() / 1000);
    }
  } catch (e) { console.log("Erro na data de volta: ", e); }

  const passageirosIda = itemsToGeocode.filter(p => p.type === "passageiro");
  const passageirosVolta = [...passageirosIda].reverse();

  const finalUsersVolta = passageirosVolta.map((u, index) => {
    const original = tripInfo.passengers.find(p => p.name === u.name) || {};
    return {
      id: u.id,
      sequence: (index * 2) + 1,
      name: u.name,
      phone: u.phone.replace(/\D/g, ""),
      passenger_re: original.re || "",
      passenger_cost_center: u.costCenter,
      pickup: {
        address: tripInfo.destinations[0].location.address || "",
        neighborhood: destInfo.neighborhood,
        city: destInfo.city,
        state: destInfo.state,
        postal_code: destInfo.postal_code,
        lat: destInfo.lat,
        lng: destInfo.lng
      }
    };
  });

  const finalDestinationsVolta = passageirosVolta.map((u, index) => {
    const info = userInfo[u.id] || { lat: "", lng: "", neighborhood: "", city: "", state: "", postal_code: "" };
    return {
      passengerId: u.id,
      sequence: (index * 2) + 2,
      location: {
        address: u.original_address,
        neighborhood: info.neighborhood,
        city: info.city,
        state: info.state,
        postal_code: info.postal_code,
        reference: "",
        lat: info.lat,
        lng: info.lng
      }
    };
  });

  const finalPayloadVolta = {
    partner: "322",
    user: tripInfo.company.replace(/\D/g, "") || "CNPJ_VAZIO",
    password: "0104",
    request_id: `REQ-VOLTA-${Date.now()}`,
    pickup_time: pickupTimeUnixVolta.toString(),
    distance: "0",
    stopped_time: "0",
    category: "taxi",
    passengers_no: finalUsersVolta.length,
    send_sms: 1,
    suitcases_no: 0,
    requester_name: `${tripInfo.requester || ''}`,
    extra1: tripInfo.extra1,
    extra2: tripInfo.requester,
    payment_type: tripInfo.payment,
    users: finalUsersVolta,
    destinations: finalDestinationsVolta,
    tipo_rota: "VOLTA"
  };

  console.log("\n=== JSON FINAL DE VOLTA (enviado para /rideCreate) ===");
  console.log(JSON.stringify(finalPayloadVolta, null, 2));
}
