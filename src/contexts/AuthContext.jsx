import React, { createContext, useState, useEffect, useContext } from 'react';

// Criando o contexto
export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Ao carregar o app, verifica se já tem um token salvo no navegador
  useEffect(() => {
    const tokenSalvo = localStorage.getItem('@Clinica:token');
    const usuarioSalvo = localStorage.getItem('@Clinica:usuario');

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setCarregando(false);
  }, []);

  const login = async (username, senha) => {
    const API_URL = import.meta.env.VITE_API_URL;
    
    const resposta = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, senha })
    });

    if (!resposta.ok) {
      const erroDados = await resposta.json();
      throw new Error(erroDados.erro || 'Erro ao fazer login.');
    }

    const dados = await resposta.json();

    // Salva no LocalStorage
    localStorage.setItem('@Clinica:token', dados.token);
    localStorage.setItem('@Clinica:usuario', JSON.stringify(dados.usuario));

    // Salva no Estado Global
    setToken(dados.token);
    setUsuario(dados.usuario);
  };

  const logout = () => {
    localStorage.removeItem('@Clinica:token');
    localStorage.removeItem('@Clinica:usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ logado: !!token, usuario, token, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook customizado para facilitar o uso nas telas
export const useAuth = () => useContext(AuthContext);