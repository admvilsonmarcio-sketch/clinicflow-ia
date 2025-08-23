
// Dados mockados para demonstração do sistema
export const mockPatients = [
  {
    id: '1',
    nome_completo: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    telefone_celular: '(11) 98765-4321',
    data_nascimento: '1985-05-15',
    cpf: '123.456.789-01'
  },
  {
    id: '2',
    nome_completo: 'João Carlos Oliveira',
    email: 'joao.carlos@email.com',
    telefone_celular: '(11) 99876-5432',
    data_nascimento: '1978-10-22',
    cpf: '987.654.321-09'
  },
  {
    id: '3',
    nome_completo: 'Ana Paula Costa',
    email: 'ana.paula@email.com',
    telefone_celular: '(11) 91234-5678',
    data_nascimento: '1990-03-08',
    cpf: '456.789.123-45'
  },
  {
    id: '4',
    nome_completo: 'Roberto Ferreira Lima',
    email: 'roberto.lima@email.com',
    telefone_celular: '(11) 95678-1234',
    data_nascimento: '1965-12-11',
    cpf: '789.123.456-78'
  },
  {
    id: '5',
    nome_completo: 'Carla Mendes Pereira',
    email: 'carla.mendes@email.com',
    telefone_celular: '(11) 94321-8765',
    data_nascimento: '1982-07-19',
    cpf: '321.654.987-32'
  }
]

export const mockMedicos = [
  {
    id: 'med1',
    nome_completo: 'Dr. Carlos Alberto Silva',
    cargo: 'Cardiologista',
    email: 'carlos.silva@clinica.com'
  },
  {
    id: 'med2',
    nome_completo: 'Dra. Ana Beatriz Santos',
    cargo: 'Dermatologista',
    email: 'ana.santos@clinica.com'
  },
  {
    id: 'med3',
    nome_completo: 'Dr. Ricardo Fernandes',
    cargo: 'Ortopedista',
    email: 'ricardo.fernandes@clinica.com'
  },
  {
    id: 'med4',
    nome_completo: 'Dra. Luciana Rodrigues',
    cargo: 'Pediatra',
    email: 'luciana.rodrigues@clinica.com'
  }
]

export const mockConsultas = [
  {
    id: 'cons1',
    titulo: 'Consulta de Rotina - Cardiologia',
    descricao: 'Check-up anual, avaliação cardiovascular',
    data_consulta: new Date(2025, 7, 26, 9, 0).toISOString(), // 26 Aug 2025, 09:00
    duracao_minutos: 60,
    status: 'agendada' as const,
    paciente_id: '1',
    medico_id: 'med1',
    clinica_id: 'clinic1',
    observacoes: 'Paciente com histórico de hipertensão',
    pacientes: [{
      id: '1',
      nome_completo: 'Maria Silva Santos',
      email: 'maria.silva@email.com',
      telefone_celular: '(11) 98765-4321'
    }],
    perfis: [{
      id: 'med1',
      nome_completo: 'Dr. Carlos Alberto Silva',
      cargo: 'Cardiologista'
    }],
    clinicas: [{
      id: 'clinic1',
      nome: 'Clínica MediFlow'
    }]
  },
  {
    id: 'cons2',
    titulo: 'Retorno - Dermatologia',
    descricao: 'Avaliação de tratamento para acne',
    data_consulta: new Date(2025, 7, 26, 14, 30).toISOString(), // 26 Aug 2025, 14:30
    duracao_minutos: 30,
    status: 'confirmada' as const,
    paciente_id: '2',
    medico_id: 'med2',
    clinica_id: 'clinic1',
    observacoes: 'Paciente em tratamento há 2 meses',
    pacientes: [{
      id: '2',
      nome_completo: 'João Carlos Oliveira',
      email: 'joao.carlos@email.com',
      telefone_celular: '(11) 99876-5432'
    }],
    perfis: [{
      id: 'med2',
      nome_completo: 'Dra. Ana Beatriz Santos',
      cargo: 'Dermatologista'
    }],
    clinicas: [{
      id: 'clinic1',
      nome: 'Clínica MediFlow'
    }]
  },
  {
    id: 'cons3',
    titulo: 'Consulta Ortopédica - Joelho',
    descricao: 'Dor no joelho direito após atividade física',
    data_consulta: new Date(2025, 7, 27, 10, 0).toISOString(), // 27 Aug 2025, 10:00
    duracao_minutos: 45,
    status: 'agendada' as const,
    paciente_id: '3',
    medico_id: 'med3',
    clinica_id: 'clinic1',
    observacoes: 'Paciente pratica corrida regularmente',
    pacientes: [{
      id: '3',
      nome_completo: 'Ana Paula Costa',
      email: 'ana.paula@email.com',
      telefone_celular: '(11) 91234-5678'
    }],
    perfis: [{
      id: 'med3',
      nome_completo: 'Dr. Ricardo Fernandes',
      cargo: 'Ortopedista'
    }],
    clinicas: [{
      id: 'clinic1',
      nome: 'Clínica MediFlow'
    }]
  },
  {
    id: 'cons4',
    titulo: 'Consulta Pediátrica - Vacinação',
    descricao: 'Aplicação de vacinas e avaliação geral',
    data_consulta: new Date(2025, 7, 28, 8, 30).toISOString(), // 28 Aug 2025, 08:30
    duracao_minutos: 30,
    status: 'agendada' as const,
    paciente_id: '4',
    medico_id: 'med4',
    clinica_id: 'clinic1',
    observacoes: 'Criança de 8 anos, sem alergias conhecidas',
    pacientes: [{
      id: '4',
      nome_completo: 'Roberto Ferreira Lima',
      email: 'roberto.lima@email.com',
      telefone_celular: '(11) 95678-1234'
    }],
    perfis: [{
      id: 'med4',
      nome_completo: 'Dra. Luciana Rodrigues',
      cargo: 'Pediatra'
    }],
    clinicas: [{
      id: 'clinic1',
      nome: 'Clínica MediFlow'
    }]
  },
  {
    id: 'cons5',
    titulo: 'Check-up Cardiológico',
    descricao: 'Avaliação preventiva anual',
    data_consulta: new Date(2025, 7, 29, 15, 0).toISOString(), // 29 Aug 2025, 15:00
    duracao_minutos: 60,
    status: 'confirmada' as const,
    paciente_id: '5',
    medico_id: 'med1',
    clinica_id: 'clinic1',
    observacoes: 'Paciente com histórico familiar de problemas cardíacos',
    pacientes: [{
      id: '5',
      nome_completo: 'Carla Mendes Pereira',
      email: 'carla.mendes@email.com',
      telefone_celular: '(11) 94321-8765'
    }],
    perfis: [{
      id: 'med1',
      nome_completo: 'Dr. Carlos Alberto Silva',
      cargo: 'Cardiologista'
    }],
    clinicas: [{
      id: 'clinic1',
      nome: 'Clínica MediFlow'
    }]
  }
]

export const mockClinica = {
  id: 'clinic1',
  nome: 'Clínica MediFlow',
  endereco: 'Rua das Flores, 123 - Centro',
  telefone: '(11) 3333-4444',
  email: 'contato@mediflow.com.br'
}
