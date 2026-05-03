"""add quiz tables and chapter_completion quiz columns

Revision ID: 001_quiz_feature
Revises: 
Create Date: 2026-05-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


revision = '001_quiz_feature'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'quiz_question',
        sa.Column('uid', PG_UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('chapter_id', PG_UUID(as_uuid=True), sa.ForeignKey('chapter.uid'), nullable=False),
        sa.Column('text', sa.Text, nullable=False),
        sa.Column('option_a', sa.String(500), nullable=False),
        sa.Column('option_b', sa.String(500), nullable=False),
        sa.Column('option_c', sa.String(500), nullable=False),
        sa.Column('option_d', sa.String(500), nullable=False),
        sa.Column('correct_option', sa.String(1), nullable=False),
        sa.Column('explanation', sa.Text, nullable=True),
        sa.Column('created_at', sa.TIMESTAMP, nullable=False),
    )
    op.create_index('ix_quiz_question_chapter_id', 'quiz_question', ['chapter_id'])

    op.create_table(
        'quiz_attempt',
        sa.Column('uid', PG_UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('chapter_id', PG_UUID(as_uuid=True), sa.ForeignKey('chapter.uid'), nullable=False),
        sa.Column('user_id', PG_UUID(as_uuid=True), sa.ForeignKey('user.uid'), nullable=False),
        sa.Column('started_at', sa.TIMESTAMP, nullable=False),
        sa.Column('submitted_at', sa.TIMESTAMP, nullable=True),
        sa.Column('score', sa.Integer, nullable=True),
        sa.Column('is_passed', sa.Boolean, nullable=False, server_default='false'),
    )
    op.create_index('ix_quiz_attempt_user_chapter', 'quiz_attempt', ['user_id', 'chapter_id'])

    op.create_table(
        'quiz_attempt_question',
        sa.Column('uid', PG_UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('attempt_id', PG_UUID(as_uuid=True), sa.ForeignKey('quiz_attempt.uid'), nullable=False),
        sa.Column('question_id', PG_UUID(as_uuid=True), sa.ForeignKey('quiz_question.uid'), nullable=False),
        sa.Column('position', sa.Integer, nullable=False),
        sa.Column('selected_option', sa.String(1), nullable=True),
        sa.Column('is_correct', sa.Boolean, nullable=True),
        sa.UniqueConstraint('attempt_id', 'question_id', name='uq_attempt_question'),
    )
    op.create_index('ix_quiz_attempt_question_attempt_id', 'quiz_attempt_question', ['attempt_id'])
    op.create_index('ix_quiz_attempt_question_question_attempt', 'quiz_attempt_question', ['question_id', 'attempt_id'])

    op.add_column('chapter_completion', sa.Column('passed_at', sa.TIMESTAMP, nullable=True))
    op.add_column('chapter_completion', sa.Column('best_quiz_score', sa.Integer, nullable=True))
    op.add_column('chapter_completion', sa.Column('quiz_attempts', sa.Integer, nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('chapter_completion', 'quiz_attempts')
    op.drop_column('chapter_completion', 'best_quiz_score')
    op.drop_column('chapter_completion', 'passed_at')

    op.drop_index('ix_quiz_attempt_question_question_attempt', table_name='quiz_attempt_question')
    op.drop_index('ix_quiz_attempt_question_attempt_id', table_name='quiz_attempt_question')
    op.drop_table('quiz_attempt_question')

    op.drop_index('ix_quiz_attempt_user_chapter', table_name='quiz_attempt')
    op.drop_table('quiz_attempt')

    op.drop_index('ix_quiz_question_chapter_id', table_name='quiz_question')
    op.drop_table('quiz_question')
