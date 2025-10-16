import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3031/api';

export async function getLeads() {
  const response = await fetch(`${API_URL}/leads`);
  if (!response.ok) {
    throw new Error('Failed to fetch leads');
  }
  return response.json();
}

export async function getClientData(telefone: string) {
  const response = await fetch(`${API_URL}/cliente/${telefone}`);
  if (!response.ok) {
    throw new Error('Failed to fetch client data');
  }
  return response.json();
}

export async function getClientHistory(telefone: string) {
  const response = await fetch(`${API_URL}/cliente/${telefone}/historico`);
  if (!response.ok) {
    throw new Error('Failed to fetch client history');
  }
  return response.json();
}

export async function getClientAppointments(telefone: string) {
  const response = await fetch(`${API_URL}/cliente/${telefone}/agendamentos`);
  if (!response.ok) {
    throw new Error('Failed to fetch client appointments');
  }
  return response.json();
}

export async function getDashboardStats() {
  const response = await fetch(`${API_URL}/dashboard/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  return response.json();
}

