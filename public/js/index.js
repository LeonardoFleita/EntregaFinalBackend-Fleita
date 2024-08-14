//Agregar producto al carrito

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
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        Swal.fire({
          title: "Producto agregado al carrito",
          icon: "success",
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "Ver carrito",
          cancelButtonText: "Seguir comprando",
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.href = `/carts/${cartId}`;
          }
        });
      } else {
        Swal.fire({
          title: res.error,
          icon: "error",
        });
        throw new Error(res.error);
      }
    })
    .catch((err) => console.error(err));
}

//Eliminar producto

function deleteProduct(prodId) {
  fetch(`/api/products/${prodId}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        Swal.fire({
          title: "Producto eliminado",
          icon: "success",
        }).then(() => window.location.reload());
      } else {
        Swal.fire({
          title: res.error,
          icon: "error",
        });
      }
    })
    .catch((err) => console.error(err));
}
