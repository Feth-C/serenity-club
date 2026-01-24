// frontend/src/pages/Clients/ClientsList.jsx

import { useEffect, useState } from 'react';
import { getClients, deleteClient } from '../../api/clients';
import { useNavigate } from 'react-router-dom';

export default function ClientsList() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadClients = async () => {
        try {
            const res = await getClients();
            setClients(res.data.data);
        } catch (err) {
            console.error('Erro ao carregar clientes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Deseja remover este cliente?')) return;
        await deleteClient(id);
        loadClients();
    };

    if (loading) return <p>Carregando...</p>;

    return (
        <div>
            <h1>Clientes</h1>

            <button onClick={() => navigate('/clients/new')}>
                Novo Cliente
            </button>

            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map(client => (
                        <tr key={client.id}>
                            <td>{client.name}</td>
                            <td>{client.email || '-'}</td>
                            <td>{client.phone || '-'}</td>
                            <td>
                                <button onClick={() => navigate(`/clients/${client.id}`)}>
                                    Editar
                                </button>
                                <button onClick={() => handleDelete(client.id)}>
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
