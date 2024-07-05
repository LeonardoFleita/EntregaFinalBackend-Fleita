//Agregar al carrito

function addToCart(product, cart) {
  let cartId = cart ? cart : ":cId";
  let productId = product ? product : ":pId";
  fetch(`/api/carts/${cartId}/products/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((error) => {
          throw new Error(JSON.stringify(error));
        });
      }
      res.json();
    })
    .then((res) => (window.location.href = `/carts/${cartId}`))
    .catch((err) => console.log("Error en la solicitud:", err.message));
}
