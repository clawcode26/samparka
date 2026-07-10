"use client";
import styles from "../Dashboard.module.css";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function ManagerDashboard() {
  const staff = [
    { id: 'E001', name: "Aarav Mishra", role: "Chief Editor", email: "aarav@sampark.in", joined: "Jan 12, 2024" },
    { id: 'R014', name: "Sarada Panda", role: "Reporter (Politics)", email: "sarada@sampark.in", joined: "Mar 05, 2025" },
    { id: 'R015', name: "Anita Sahu", role: "Reporter (Education)", email: "anita@sampark.in", joined: "Apr 18, 2025" },
    { id: 'R016', name: "Ritesh Mohanty", role: "Reporter (Business)", email: "ritesh@sampark.in", joined: "Jul 22, 2025" },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--neutral-900)', marginBottom: '4px' }}>Staff Directory</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Manage all active reporters and editors.</p>
        </div>
        <Link href="/dashboard/manager/onboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--brand-color)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '14px', fontWeight: 600 }}>
          <UserPlus size={16} /> Onboard New Staff
        </Link>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>Active Personnel ({staff.length})</div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role / Beat</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(person => (
              <tr key={person.id}>
                <td style={{ color: 'var(--text-light)', fontSize: '12px' }}>{person.id}</td>
                <td style={{ fontWeight: 500 }}>{person.name}</td>
                <td>{person.role}</td>
                <td>{person.email}</td>
                <td>{person.joined}</td>
                <td>
                  <button className={styles.actionBtn}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
