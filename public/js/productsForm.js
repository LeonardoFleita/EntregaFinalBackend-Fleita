//Carga de productos

const productsForm = document.getElementById("productsForm");

productsForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const formData = new FormData(productsForm);
  fetch(`/api/products/`, { method: "POST", body: formData })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        Swal.fire({
          title: "Producto cargado exitosamente",
          icon: "success",
        }).then((res) => {
          if (res.isConfirmed) {
            window.location.reload();
          }
        });
      } else {
        Swal.fire({
          title: res.error,
          icon: "error",
        });
      }
    })
    .catch((err) => console.error(err));
});
