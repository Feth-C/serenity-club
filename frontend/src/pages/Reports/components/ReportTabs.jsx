// frontend/src/pages/reports/components/ReportTabs.jsx

import React from "react";

const tabs = [
    { key: "sessions", label: "Sessioni" },
    { key: "financial", label: "Finanziario" },
    { key: "operational", label: "Operativo" }
];

const ReportTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div
            style={{
                display: "flex",
                gap: "10px",
                marginBottom: "20px",
                borderBottom: "3px solid #000",
                paddingBottom: "5px"
            }}
        >
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                        padding: "8px 18px",
                        borderRadius: "20px 20px 0 0",
                        border: activeTab === tab.key ? "2px solid #000" : "1px solid #000",
                        borderBottom: activeTab === tab.key ? "2px solid #867e61" : "1px solid #000",
                        backgroundColor: activeTab === tab.key ? "#000" : "#35352b",
                        color: activeTab === tab.key ? "#fff" : "#000",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.2s ease"
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default ReportTabs;
