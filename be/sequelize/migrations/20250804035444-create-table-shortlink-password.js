/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shortlink_passwords', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Hashed password required to access the shortlink',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When this password becomes active',
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When this password expires',
      },
      shortlink_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shortlinks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Shortlink this password protects',
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
    await queryInterface.addIndex('shortlink_passwords', ['shortlink_id'], {
      name: 'idx_shortlink_passwords_shortlink_id',
    });

    await queryInterface.addIndex('shortlink_passwords', ['start_time'], {
      name: 'idx_shortlink_passwords_start_time',
    });

    await queryInterface.addIndex('shortlink_passwords', ['end_time'], {
      name: 'idx_shortlink_passwords_end_time',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shortlink_passwords');
  },
};
