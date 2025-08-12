"""add name column to users

Revision ID: 7f3c1a8d4b2e
Revises: a1b2c3d4e5f6
Create Date: 2025-08-12 09:37:00.123456

"""
from alembic import op
import sqlalchemy as sa

revision: str = '7f3c1a8d4b2e'
down_revision: str = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('users', sa.Column('name', sa.String(), nullable=False, server_default='Unknown'))
    op.create_index(op.f('ix_users_name'), 'users', ['name'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_users_name'), table_name='users')
    op.drop_column('users', 'name')