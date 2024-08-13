//Realiza la compra

const dataTicket = document.getElementById("dataTicket");
const dataSinComprar = document.getElementById("dataSinComprar");

const ticket = JSON.parse(sessionStorage.getItem("ticket"));

dataTicket.innerHTML = `<p>Código de compra: ${ticket.code}</p>
<p>Fecha: ${ticket.purchase_datetime}</p>
<p>Email del comprador: ${ticket.purchaser}</p>
`;

let sinComprar = JSON.parse(sessionStorage.getItem("sinComprar"));
if (sinComprar) {
  sinComprar = sinComprar.map((prod) => `<li>${prod.product.title}</li>`);
  dataSinComprar.innerHTML = `<p>Los siguientes productos quedaron sin comprar por falta de stock: 
  <ul>
  ${sinComprar.join("")}
  </ul>
  </p>
  `;
}

sessionStorage.clear();
