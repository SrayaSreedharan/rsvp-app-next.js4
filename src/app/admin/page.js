"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DataGrid } from '@mui/x-data-grid';

export default function Admin() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchRSVP();
  }, []);

  async function fetchRSVP() {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setRows(data.map((row, index) => ({
        id: index + 1,
        name: row.name,
        email: row.email,
        attending: row.attending ? 'Yes' : 'No',
        created_at: new Date(row.created_at).toLocaleString()
      })));
    }
  }

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'attending', headerName: 'Attending', flex: 1 },
    { field: 'created_at', headerName: 'Submitted At', flex: 1 },
  ];

  return (
    <div style={{ height: 500, width: '80%', margin: 'auto', marginTop: '20px' }}>
      <h1>RSVP Admin</h1>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}
