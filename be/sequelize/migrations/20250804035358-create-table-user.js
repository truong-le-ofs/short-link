'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Email address of the user',
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Hashed password of the user',
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the user email is verified',
      },
      verification_token: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Token used for email verification',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    // Indexes
    await queryInterface.addIndex('users', ['username'], {
      name: 'idx_users_username',
      unique: true,
    });

    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email',
      unique: true,
    });

    await queryInterface.addIndex('users', ['verification_token'], {
      name: 'idx_users_verification_token',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  },
};
