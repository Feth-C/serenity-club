// frontend/src/pages/Auth/Login.jsx

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../api/api";
import logo from "../../assets/brand/serenity_logotipo.svg";
import Button from "../../components/ui/Button/Button";

import "./auth.css";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  const [setupMode, setSetupMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // Verifica se existe algum usuário no backend
  // -----------------------------
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
      return;
    }

    const checkSetup = async () => {
      try {
        const res = await api.get("/auth/setup-check");
        setSetupMode(res.setupMode);
      } catch (err) {
        console.error("Erro verificando setup:", err);
      }
    };

    checkSetup();
  }, [isAuthenticated, navigate]);

  // -----------------------------
  // Login normal
  // -----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Erro durante login");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Criação do admin inicial
  // -----------------------------
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/setup-admin", { name, email, password });

      // Atualiza o setupMode
      setSetupMode(false);

      // Loga automaticamente
      await login(email, password);

      // Redireciona
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Erro criando administrador");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__card">
        <div className="auth__logo">
          <img src={logo} alt="Serenity Club" />
        </div>

        <h2 className="auth__title">
          {setupMode ? "Configuração Inicial" : "Login"}
        </h2>

        {setupMode && (
          <p className="auth__setup-text">
            Nenhum usuário encontrado. Crie o administrador inicial do sistema.
          </p>
        )}

        <form
          className="auth__form"
          onSubmit={setupMode ? handleCreateAdmin : handleLogin}
        >
          {setupMode && (
            <div className="auth__field">
              <label className="auth__label">Nome</label>
              <input
                className="auth__input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth__field">
            <label className="auth__label">Email</label>
            <input
              className="auth__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth__field">
            <label className="auth__label">Senha</label>
            <input
              className="auth__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="auth__error">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading
              ? "Processando..."
              : setupMode
                ? "Criar Administrador"
                : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;