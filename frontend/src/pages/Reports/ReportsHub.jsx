// frontend/src/pages/Reports/ReportsHub.jsx

import React, { useState } from "react";
import ReportTabs from "../../components/reports/ReportTabs";

import ReportsSessions from "./ReportsSessions";
import ReportsFinancial from "./ReportsFinancial";
import ReportsOperational from "./ReportsOperational";

const ReportsHub = () => {
    const [activeTab, setActiveTab] = useState("sessions");

    return (
        <div
            style={{
                padding: "20px",
                minHeight: "100vh"
            }}
        >
            <h1 style={{ marginBottom: "20px", color: "#bebebe" }}>
                Relatórios
            </h1>

            <ReportTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div
                style={{
                    backgroundColor: "#35352b",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                }}
            >
                {activeTab === "sessions" && <ReportsSessions />}
                {activeTab === "financial" && <ReportsFinancial />}
                {activeTab === "operational" && <ReportsOperational />}
            </div>
        </div>
    );
};

export default ReportsHub;
