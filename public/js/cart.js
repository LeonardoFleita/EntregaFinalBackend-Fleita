const cleanCartBttn = document.getElementById("cleanCart");
const deleteProdBttn = [...document.getElementsByClassName("deleteProduct")];
const substractBttn = [...document.getElementsByClassName("substract")];
const addBttn = [...document.getElementsByClassName("add")];
const cartId = cleanCartBttn.getAttribute("data-cartId");

function getProductInfo(event) {
  const cartCard = event.target.closest(".cartCard");
  const prodId = cartCard.getAttribute("data-prodId");
  let quantity = parseInt(cartCard.getAttribute("data-quantity"));
  return { prodId, quantity };
}

//Función para actualizar la cantidad de un producto

function uploadQuantity(prodId, quantity, cartId) {
  fetch(`/api/carts/${cartId}/products/${prodId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  })
    .then((res) => res.json())
    .then(() => window.location.reload())
    .catch((err) => console.log(err));
}

//Función para eliminar un producto

function deleteProduct(prodId, cartId) {
  fetch(`/api/carts/${cartId}/products/${prodId}`, { method: "DELETE" })
    .then((res) => res.json())
    .then(() => {
      window.location.reload();
    })
    .catch((err) => console.log(err));
}

// Verifica que el carrito tenga productos

fetch(`/api/carts/${cartId}`, { method: "GET" })
  .then((res) => res.json())
  .then((res) => {
    const products = res.payload.products;
    if (products.length < 1) {
      Swal.fire({
        title: "Carrito vacío",
        text: "Será redireccionado al inicio",
      }).then(() => {
        window.location.href = "/";
      });
    }
  });

// Resta la cantidad de un producto

substractBttn.forEach((b) => {
  b.addEventListener("click", (event) => {
    let { prodId, quantity } = getProductInfo(event);
    quantity -= 1;
    if (quantity > 0) {
      uploadQuantity(prodId, quantity, cartId);
    } else {
      deleteProduct(prodId, cartId);
    }
  });
});

//Suma la cantidad de un producto

addBttn.forEach((b) => {
  b.addEventListener("click", (event) => {
    let { prodId, quantity } = getProductInfo(event);
    quantity++;
    uploadQuantity(prodId, quantity, cartId);
  });
});

//Elimina un producto

deleteProdBttn.forEach((b) => {
  b.addEventListener("click", (event) => {
    let { prodId } = getProductInfo(event);
    deleteProduct(prodId, cartId);
  });
});

//Vacía el carrito

cleanCartBttn.addEventListener("click", () => {
  fetch(`/api/carts/${cartId}`, { method: "DELETE" })
    .then((res) => res.json())
    .then(() =>
      Swal.fire({
        title: "Carrito vacío",
        icon: "success",
      }).then(() => {
        window.location.reload();
      })
    )
    .catch((err) => console.log(err));
});

//Realiza la compra

function purchase(cartId) {
  fetch(`/api/carts/${cartId}/purchase`, { method: "POST" })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      if (res.status === "success") {
        const ticket = res.payload.ticket;
        sessionStorage.setItem("ticket", JSON.stringify(ticket));
        if (res.payload.sinComprar) {
          const sinComprar = res.payload.sinComprar;
          sessionStorage.setItem("sinComprar", JSON.stringify(sinComprar));
        }
        window.location.href = "/purchase";
      } else {
        Swal.fire({
          title: res.error,
          icon: "error",
        });
      }
    })
    .catch((err) => console.log(err));
}
