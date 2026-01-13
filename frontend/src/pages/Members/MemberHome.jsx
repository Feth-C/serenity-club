// src/pages/member/MemberHome.jsx

import { useEffect, useState } from "react";
import api from "../../api/api";
import "./MemberHome.css";

export default function MemberHome() {
    const [member, setMember] = useState(null);

    useEffect(() => {
        async function loadMemberData() {
            try {
                const response = await api.get("/auth/me");
                setMember(response.data.data);
            } catch (error) {
                console.error("Errore durante il caricamento dei dati del membro", error);
            }
        }

        loadMemberData();
    }, []);

    if (!member) {
        return <p>Caricamento.23..</p>;
    }

    return (
        <div className="member-home">
            <header className="member-header">
                <h2>Benvenuto, {member.name}</h2>
            </header>

            {/* RESUMO DO CONTRATO */}
            <section className="card">
                <h3>Contrarre</h3>
                <p><strong>Inizio:</strong> {member.contract.startDate}</p>
                <p><strong>Fine:</strong> {member.contract.endDate}</p>
            </section>

            {/* STATUS GERAL */}
            <section className="card status">
                <h3>Stato</h3>
                <p>{member.statusMessage}</p>
            </section>

            {/* DOCUMENTOS */}
            <section className="card">
                <h3>Documentazione</h3>
                <ul className="documents-list">
                    {member.documents.map((doc, index) => (
                        <li key={index} className={`doc ${doc.status}`}>
                            <span>{doc.name}</span>
                            {doc.expiresAt && (
                                <small>Scadenza: {doc.expiresAt}</small>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
