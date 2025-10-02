import database from '@/lib/db';
import { createId, jsonArray, toISO } from '@/lib/utils';
import type { UserRole } from '@/types/database';
import { questionnaireSchema } from '@/lib/validators';

const listAllStatement = database.prepare(
  `SELECT * FROM questionnaires ORDER BY datetime(created_at) DESC`
);

const listByConsultantStatement = database.prepare(
  `SELECT * FROM questionnaires WHERE consultant_id = ? ORDER BY datetime(created_at) DESC`
);

const listForClientStatement = database.prepare(
  `SELECT questionnaires.* FROM questionnaire_responses
     INNER JOIN questionnaires ON questionnaires.id = questionnaire_responses.questionnaire_id
     WHERE questionnaire_responses.client_id = ?
     ORDER BY datetime(questionnaire_responses.submitted_at) DESC`
);

const getQuestionnaireStatement = database.prepare(`SELECT * FROM questionnaires WHERE id = ?`);
const getQuestionsStatement = database.prepare(`SELECT * FROM questions WHERE questionnaire_id = ? ORDER BY position ASC`);
const getOptionsStatement = database.prepare(`SELECT * FROM question_options WHERE question_id = ? ORDER BY position ASC`);

const insertQuestionnaireStatement = database.prepare(
  `INSERT INTO questionnaires (id, consultant_id, title, description, created_at, updated_at)
   VALUES (@id, @consultant_id, @title, @description, @created_at, @updated_at)`
);

const insertQuestionStatement = database.prepare(
  `INSERT INTO questions (id, questionnaire_id, prompt, type, required, position)
   VALUES (@id, @questionnaire_id, @prompt, @type, @required, @position)`
);

const insertOptionStatement = database.prepare(
  `INSERT INTO question_options (id, question_id, label, value, position)
   VALUES (@id, @question_id, @label, @value, @position)`
);

const deleteQuestionsByQuestionnaireStatement = database.prepare(`DELETE FROM questions WHERE questionnaire_id = ?`);
const deleteOptionsByQuestionStatement = database.prepare(`DELETE FROM question_options WHERE question_id = ?`);
const deleteQuestionnaireStatement = database.prepare(`DELETE FROM questionnaires WHERE id = ?`);

const insertResponseStatement = database.prepare(
  `INSERT INTO questionnaire_responses (id, questionnaire_id, client_id, consultant_id, submitted_at)
   VALUES (@id, @questionnaire_id, @client_id, @consultant_id, @submitted_at)`
);

const insertAnswerStatement = database.prepare(
  `INSERT INTO questionnaire_answers (id, response_id, question_id, answer)
   VALUES (@id, @response_id, @question_id, @answer)`
);

export const questionnairesRepository = {
  listForUser(userId: string, role: UserRole) {
    if (role === 'ADMIN') return listAllStatement.all();
    if (role === 'CONSULTANT') return listByConsultantStatement.all(userId);
    return listForClientStatement.all(userId);
  },

  getById(id: string) {
    const questionnaire = getQuestionnaireStatement.get(id);
    if (!questionnaire) return null;
    const questions = getQuestionsStatement.all(id);
    const enriched = questions.map((question) => ({
      ...question,
      options: getOptionsStatement.all(question.id)
    }));
    return { ...questionnaire, questions: enriched };
  },

  create(consultantId: string, payload: unknown) {
    const parsed = questionnaireSchema.parse(payload);
    const questionnaireId = createId();
    const now = toISO();
    const tx = database.transaction(() => {
      insertQuestionnaireStatement.run({
        id: questionnaireId,
        consultant_id: consultantId,
        title: parsed.title,
        description: parsed.description ?? null,
        created_at: now,
        updated_at: now
      });

      parsed.questions.forEach((question, index) => {
        const questionId = question.id ?? createId();
        insertQuestionStatement.run({
          id: questionId,
          questionnaire_id: questionnaireId,
          prompt: question.prompt,
          type: question.type,
          required: question.required ? 1 : 0,
          position: index
        });

        question.options?.forEach((option, optIndex) => {
          insertOptionStatement.run({
            id: option.id ?? createId(),
            question_id: questionId,
            label: option.label,
            value: option.value,
            position: optIndex
          });
        });
      });
    });

    tx();
    return this.getById(questionnaireId);
  },

  update(questionnaireId: string, consultantId: string, payload: unknown) {
    const parsed = questionnaireSchema.parse(payload);
    const now = toISO();
    const tx = database.transaction(() => {
      database
        .prepare(
          `UPDATE questionnaires SET title = @title, description = @description, updated_at = @updated_at WHERE id = @id AND consultant_id = @consultant_id`
        )
        .run({ id: questionnaireId, consultant_id: consultantId, title: parsed.title, description: parsed.description ?? null, updated_at: now });

      const existingQuestions = getQuestionsStatement.all(questionnaireId);
      existingQuestions.forEach((question) => {
        deleteOptionsByQuestionStatement.run(question.id);
      });
      deleteQuestionsByQuestionnaireStatement.run(questionnaireId);

      parsed.questions.forEach((question, index) => {
        const questionId = question.id ?? createId();
        insertQuestionStatement.run({
          id: questionId,
          questionnaire_id: questionnaireId,
          prompt: question.prompt,
          type: question.type,
          required: question.required ? 1 : 0,
          position: index
        });
        question.options?.forEach((option, optIndex) => {
          insertOptionStatement.run({
            id: option.id ?? createId(),
            question_id: questionId,
            label: option.label,
            value: option.value,
            position: optIndex
          });
        });
      });
    });

    tx();
    return this.getById(questionnaireId);
  },

  delete(questionnaireId: string, consultantId: string) {
    const questionnaire = getQuestionnaireStatement.get(questionnaireId);
    if (!questionnaire || questionnaire.consultant_id !== consultantId) {
      throw new Error('Questionário não encontrado');
    }
    const tx = database.transaction(() => {
      const questions = getQuestionsStatement.all(questionnaireId);
      questions.forEach((question) => deleteOptionsByQuestionStatement.run(question.id));
      deleteQuestionsByQuestionnaireStatement.run(questionnaireId);
      deleteQuestionnaireStatement.run(questionnaireId);
    });
    tx();
  },

  submitResponse(questionnaireId: string, clientId: string, consultantId: string, answers: Record<string, string | string[]>) {
    const responseId = createId();
    const now = toISO();
    const tx = database.transaction(() => {
      insertResponseStatement.run({
        id: responseId,
        questionnaire_id: questionnaireId,
        client_id: clientId,
        consultant_id: consultantId,
        submitted_at: now
      });

      Object.entries(answers).forEach(([questionId, value]) => {
        const storedValue = Array.isArray(value) ? jsonArray(value) : value;
        insertAnswerStatement.run({
          id: createId(),
          response_id: responseId,
          question_id: questionId,
          answer: storedValue
        });
      });
    });
    tx();
    return { id: responseId };
  }
};
