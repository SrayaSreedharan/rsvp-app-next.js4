"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Admin() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ total: 0, attendingYes: 0, attendingNo: 0 });

  useEffect(() => {
    fetchRSVP();
  }, []);

  async function fetchRSVP() {
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRows(data);

      // calculate stats
      const yes = data.filter((r) => r.attending).length;
      const no = data.length - yes;
      setStats({ total: data.length, attendingYes: yes, attendingNo: no });
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-card header-card">
        <h1>✨ RSVP Dashboard</h1>
        <p>Manage event responses in style 💖</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>Total RSVPs</h2>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card">
          <h2>Attending 🎉</h2>
          <p>{stats.attendingYes}</p>
        </div>
        <div className="stat-card">
          <h2>Not Attending 😢</h2>
          <p>{stats.attendingNo}</p>
        </div>
      </div>

      <div className="admin-card table-card">
        <h2>📋 RSVP Submissions</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Attending</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.attending ? "Yes" : "No"}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
