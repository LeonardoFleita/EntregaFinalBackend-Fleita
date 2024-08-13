const switchButton = document.getElementById("switchRole");
const userId = document.getElementById("userId");
const deleteButton = document.getElementById("deleteUser");

switchButton.addEventListener("click", () => {
  const id = userId.textContent;
  fetch(`/api/users/premium/${id}`, { method: "POST" })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        Swal.fire({
          title: "Cambio realizado",
          icon: "success",
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          title: "Error",
          text: `${res.error}`,
          icon: "error",
        });
        throw new Error(res.error);
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

deleteButton.addEventListener("click", () => {
  const id = userId.textContent;
  fetch(`/api/users/${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        Swal.fire({
          title: "Usuario eliminado",
          icon: "success",
        }).then(() => {
          window.location.href = "/users";
        });
      } else {
        Swal.fire({
          title: "Error",
          text: `${res.error}`,
          icon: "error",
        });
        throw new Error(res.error);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
