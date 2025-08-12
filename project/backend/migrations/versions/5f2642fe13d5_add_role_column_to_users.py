"""add role column to users

Revision ID: a1b2c3d4e5f6
Revises: 1a8a24c490dc
Create Date: 2025-08-11 14:00:00.123456

"""
from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: str = '1a8a24c490dc'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add the role column without NOT NULL constraint initially
    op.add_column('users', sa.Column('role', sa.String(), nullable=True))
    
    # Set default value 'employee' for existing rows
    op.execute("UPDATE users SET role = 'employee' WHERE role IS NULL")
    
    # Add NOT NULL constraint
    op.alter_column('users', 'role', nullable=False, server_default='employee')
    
    # Create index for role
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_column('users', 'role')