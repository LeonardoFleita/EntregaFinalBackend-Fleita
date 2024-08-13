//Eliminar usuarios por inactividad

function properties(userId) {
  window.location.href = `/manageUsers/${userId}`;
}

function deleteUsers() {
  fetch("/api/users/", { method: "DELETE" })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "info") {
        Swal.fire({
          title: "No hay usuarios inactivos",
          icon: "info",
        }).then(() => window.location.reload());
      } else if (res.status === "success") {
        Swal.fire({
          title: "Usuarios eliminados",
          icon: "success",
        }).then(() => window.location.reload());
      } else {
        throw new Error(res.error);
      }
    })
    .catch((err) => console.error(err));
}
