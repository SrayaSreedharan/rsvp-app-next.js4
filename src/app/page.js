"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {Container,TextField,Button,Typography,Dialog,DialogTitle,DialogContent,Slide,} from "@mui/material";

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rsvps, setRsvps] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fetchRSVP = async () => {
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("id", { ascending: false });

    if (!error) setRsvps(data);
    else console.error("Fetch error:", error);
  };

  useEffect(() => {
    fetchRSVP();

    const channel = supabase
      .channel("rsvps-inserts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rsvps" },
        (payload) => setRsvps((cur) => [payload.new, ...cur])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      alert("Please fill in both fields");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    const { data, error } = await supabase
      .from("rsvps")
      .insert([{ name, email }])
      .select();

    if (error) {
      console.error("Insert error:", error);
      alert(`Something went wrong: ${error.message}`);
      return;
    }

    setRsvps((cur) => [data[0], ...cur]);
    setName("");
    setEmail("");
    setOpenModal(true);
  };

  return (
    <div className="bg">
      <Container maxWidth="sm" className="glass-card">
        <Typography variant="h4" align="center" gutterBottom className="title">
          ✨ Event RSVP
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField label="Name" variant="outlined" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} className="pink-input"/>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={email.length > 0 && !emailRegex.test(email)}
            helperText={
              email.length > 0 && !emailRegex.test(email)
                ? "Please enter a valid email address"
                : ""
            }
            className="pink-input"
          />
          <Button type="submit" fullWidth  variant="contained" className="submit-btn" disabled={!name || !emailRegex.test(email)}>
            Submit RSVP
          </Button>
        </form>
      </Container>

      {typeof window !== "undefined" && (
        <Dialog
          open={openModal}
          onClose={() => setOpenModal(false)}
          TransitionComponent={Slide}
          TransitionProps={{ direction: "up" }}
        >
          <DialogTitle className="modal-title">🎉 Thank You!</DialogTitle>
          <DialogContent className="modal-content">
            <Typography>
              We’ve received your RSVP. Can’t wait to see you!
            </Typography>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
