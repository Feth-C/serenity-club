// frontend/src/pages/Clients/ClientForm.jsx

import { useEffect, useState } from 'react';
import { createClient, getClientById, updateClient } from '../../api/clients';
import { useNavigate, useParams } from 'react-router-dom';

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (!id) return;

    getClientById(id).then(res => {
      setForm({
        name: res.data.data.name,
        email: res.data.data.email || '',
        phone: res.data.data.phone || ''
      });
    });
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id) {
      await updateClient(id, form);
    } else {
      await createClient(form);
    }

    navigate('/clients');
  };

  return (
    <div>
      <h1>{id ? 'Editar Cliente' : 'Novo Cliente'}</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Nome"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Telefone"
          value={form.phone}
          onChange={handleChange}
        />

        <button type="submit">Salvar</button>
        <button type="button" onClick={() => navigate('/clients')}>
          Cancelar
        </button>
      </form>
    </div>
  );
}
