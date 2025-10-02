import database from '@/lib/db';
import type { UserRole } from '@/types/database';

const recentClientsStatement = database.prepare(
  `SELECT COUNT(*) as total FROM users WHERE role = 'CLIENT' AND datetime(created_at) >= datetime('now', '-30 days')`
);

const consultantRecentClientsStatement = database.prepare(
  `SELECT COUNT(*) as total FROM users WHERE role = 'CLIENT' AND consultant_id = ? AND datetime(created_at) >= datetime('now', '-30 days')`
);

const pendingInvitesStatement = database.prepare(
  `SELECT COUNT(*) as total FROM invites WHERE accepted = 0 AND expires_at > datetime('now')`
);

const pendingInvitesByConsultantStatement = database.prepare(
  `SELECT COUNT(*) as total FROM invites WHERE accepted = 0 AND expires_at > datetime('now') AND (consultant_id = ? OR created_by = ?)`
);

const pendingAppointmentsStatement = database.prepare(
  `SELECT COUNT(*) as total FROM appointments WHERE status = 'PENDING'`
);

const pendingAppointmentsByConsultantStatement = database.prepare(
  `SELECT COUNT(*) as total FROM appointments WHERE status = 'PENDING' AND consultant_id = ?`
);

const pendingAppointmentsByClientStatement = database.prepare(
  `SELECT COUNT(*) as total FROM appointments WHERE status = 'PENDING' AND client_id = ?`
);

const upcomingAppointmentsStatement = database.prepare(
  `SELECT appointments.id, appointments.start_at, appointments.end_at, appointments.status,
          consultant.name as consultant_name, client.name as client_name
     FROM appointments
     INNER JOIN users as consultant ON consultant.id = appointments.consultant_id
     INNER JOIN users as client ON client.id = appointments.client_id
     WHERE datetime(appointments.start_at) >= datetime('now')
     ORDER BY datetime(appointments.start_at)
     LIMIT 5`
);

const upcomingAppointmentsForConsultantStatement = database.prepare(
  `SELECT appointments.id, appointments.start_at, appointments.end_at, appointments.status,
          consultant.name as consultant_name, client.name as client_name
     FROM appointments
     INNER JOIN users as consultant ON consultant.id = appointments.consultant_id
     INNER JOIN users as client ON client.id = appointments.client_id
     WHERE datetime(appointments.start_at) >= datetime('now') AND appointments.consultant_id = ?
     ORDER BY datetime(appointments.start_at)
     LIMIT 5`
);

const upcomingAppointmentsForClientStatement = database.prepare(
  `SELECT appointments.id, appointments.start_at, appointments.end_at, appointments.status,
          consultant.name as consultant_name, client.name as client_name
     FROM appointments
     INNER JOIN users as consultant ON consultant.id = appointments.consultant_id
     INNER JOIN users as client ON client.id = appointments.client_id
     WHERE datetime(appointments.start_at) >= datetime('now') AND appointments.client_id = ?
     ORDER BY datetime(appointments.start_at)
     LIMIT 5`
);

const recentLookbooksStatement = database.prepare(
  `SELECT COUNT(*) as total FROM lookbooks WHERE datetime(created_at) >= datetime('now', '-30 days')`
);

const recentLookbooksByConsultantStatement = database.prepare(
  `SELECT COUNT(*) as total FROM lookbooks WHERE consultant_id = ? AND datetime(created_at) >= datetime('now', '-30 days')`
);

const recentLookbooksForClientStatement = database.prepare(
  `SELECT COUNT(*) as total FROM lookbooks WHERE client_id = ? AND datetime(created_at) >= datetime('now', '-30 days')`
);

const questionnaireCompletionStatement = database.prepare(
  `SELECT questionnaires.title, COUNT(responses.id) as total
     FROM questionnaires
     LEFT JOIN questionnaire_responses as responses ON responses.questionnaire_id = questionnaires.id
     WHERE questionnaires.consultant_id = ?
     GROUP BY questionnaires.id
     ORDER BY total DESC
     LIMIT 5`
);

const questionnaireCompletionAdminStatement = database.prepare(
  `SELECT questionnaires.title, COUNT(responses.id) as total
     FROM questionnaires
     LEFT JOIN questionnaire_responses as responses ON responses.questionnaire_id = questionnaires.id
     GROUP BY questionnaires.id
     ORDER BY total DESC
     LIMIT 5`
);

export const dashboardRepository = {
  metrics(userId: string, role: UserRole) {
    const clientCount =
      role === 'ADMIN'
        ? (recentClientsStatement.get() as { total: number })
        : (consultantRecentClientsStatement.get(userId) as { total: number });

    const inviteCount =
      role === 'ADMIN'
        ? (pendingInvitesStatement.get() as { total: number })
        : (pendingInvitesByConsultantStatement.get(userId, userId) as { total: number });

    const appointmentCount =
      role === 'ADMIN'
        ? (pendingAppointmentsStatement.get() as { total: number })
        : role === 'CONSULTANT'
        ? (pendingAppointmentsByConsultantStatement.get(userId) as { total: number })
        : (pendingAppointmentsByClientStatement.get(userId) as { total: number });

    const lookbooks =
      role === 'ADMIN'
        ? (recentLookbooksStatement.get() as { total: number })
        : role === 'CONSULTANT'
        ? (recentLookbooksByConsultantStatement.get(userId) as { total: number })
        : (recentLookbooksForClientStatement.get(userId) as { total: number });

    const upcoming =
      role === 'ADMIN'
        ? upcomingAppointmentsStatement.all()
        : role === 'CONSULTANT'
        ? upcomingAppointmentsForConsultantStatement.all(userId)
        : upcomingAppointmentsForClientStatement.all(userId);

    const questionnaireProgress =
      role === 'ADMIN'
        ? questionnaireCompletionAdminStatement.all()
        : role === 'CONSULTANT'
        ? questionnaireCompletionStatement.all(userId)
        : [];

    return {
      newClients: clientCount.total,
      pendingInvites: inviteCount.total,
      pendingAppointments: appointmentCount.total,
      lookbooksCreated: lookbooks.total,
      upcomingAppointments: upcoming,
      questionnaireProgress
    };
  }
};
