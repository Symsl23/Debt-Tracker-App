// ===============================
// Supabase Config
// ===============================
const SUPABASE_URL = "https://upwejlduvhvigunroztv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwd2VqbGR1dmh2aWd1bnJvenR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTY3OTMsImV4cCI6MjA4MTczMjc5M30.-nE6ZF3dFsXBD4yU1n0i0FtH3D3Tch2c8C7fH549mX0";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
// Auth State Change
// ===============================
supabaseClient.auth.onAuthStateChange((_, session) => {
  if (session) {
    auth.style.display = "none";
    app.style.display = "block";
    loadDebts();
  } else {
    auth.style.display = "block";
    app.style.display = "none";
  }
});

// ===============================
// Login
// ===============================
async function login() {
  const emailValue = document.getElementById("email").value;
  const passwordValue = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailValue,
    password: passwordValue
  });

  if (error) alert(error.message);
}

// ===============================
// Signup
// ===============================
async function signup() {
  const emailValue = document.getElementById("email").value;
  const passwordValue = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signUp({
    email: emailValue,
    password: passwordValue
  });

  if (error) alert(error.message);
  else alert("Account created. You can login now.");
}

// ===============================
// Logout
// ===============================
async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) alert(error.message);

  // Force state refresh
  auth.style.display = "block";
  app.style.display = "none";
}

// ===============================
// Add Debt
// ===============================
async function addDebt() {
  const user = (await supabaseClient.auth.getUser()).data.user;
  if (!user) return;

  const creditor = document.getElementById("creditor").value;
  const amount = document.getElementById("amount").value;
  const debtDate = document.getElementById("date").value;
  const bank = document.getElementById("bank").value;
  const description = document.getElementById("description").value;

  if (!creditor || !amount) {
    alert("Creditor and amount are required");
    return;
  }

  const { error } = await supabaseClient.from("debts").insert([{
    user_id: user.id,
    creditor,
    amount,
    debt_date: debtDate || null,
    bank_info: bank || null,
    description: description || null,
    status: "unpaid"
  }]);

  if (error) alert(error.message);
  else {
    document.getElementById("creditor").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
    document.getElementById("bank").value = "";
    document.getElementById("description").value = "";
    loadDebts();
  }
}

// ===============================
// Toggle Paid / Unpaid
// ===============================
async function toggleStatus(id, status) {
  const newStatus = status === "paid" ? "unpaid" : "paid";
  const { error } = await supabaseClient
    .from("debts")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) alert(error.message);
  else loadDebts();
}

// ===============================
// Delete Debt
// ===============================
async function deleteDebt(id) {
  if (!confirm("Delete this debt?")) return;

  const { error } = await supabaseClient.from("debts").delete().eq("id", id);

  if (error) alert(error.message);
  else loadDebts();
}

// ===============================
// Load Debts
// ===============================
async function loadDebts() {
  const { data, error } = await supabaseClient
    .from("debts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("debtList");
  container.innerHTML = "";

  let total = 0;

  data.forEach(d => {
    if (d.status === "unpaid") total += Number(d.amount);

    const div = document.createElement("div");
    div.className = "debt-card";

    div.innerHTML = `
      <span><strong>Creditor:</strong> ${d.creditor}</span>
      <span><strong>Amount:</strong> RM ${Number(d.amount).toFixed(2)}</span>
      <span><strong>Date:</strong> ${d.debt_date || "-"}</span>
      <span><strong>Description:</strong> ${d.description || "-"}</span>
      <span><strong>Bank:</strong> ${d.bank_info || "-"}</span>
      <span><strong>Status:</strong> <span class="status-${d.status}">${d.status}</span></span>
      <div class="card-buttons">
        <button class="btn-toggle" onclick="toggleStatus('${d.id}','${d.status}')">
          ${d.status === "paid" ? "Mark Unpaid" : "Mark Paid"}
        </button>
        <button class="btn-delete" onclick="deleteDebt('${d.id}')">Delete</button>
      </div>
    `;

    container.appendChild(div);
  });

  document.getElementById("total").innerText = total.toFixed(2);
}

// ===============================
// Expose functions to HTML
// ===============================
window.login = login;
window.signup = signup;
window.logout = logout;
window.addDebt = addDebt;
window.toggleStatus = toggleStatus;
window.deleteDebt = deleteDebt;
