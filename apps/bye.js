function logout() {
  localStorage.removeItem("credentials");
  window.location.href = "/login";
}

function bye() {
  createWindow(
    "Log out",
    `
        <center>
        <div style="text-align: center;" class="bye-app">
        Are you sure you want to log out?<br><br>
        <button class="logout-button" onclick="logout()">Log out</button>
        </div>
        </center>`,
    400,
    300,
  );
}
