'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shortlink_schedules', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      target_url: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'URL to redirect to during this time period',
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When this schedule becomes active',
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'When this schedule expires',
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
        comment: 'Shortlink this schedule belongs to',
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
    await queryInterface.addIndex('shortlink_schedules', ['shortlink_id'], {
      name: 'idx_shortlink_schedules_shortlink_id',
    });

    await queryInterface.addIndex('shortlink_schedules', ['start_time'], {
      name: 'idx_shortlink_schedules_start_time',
    });

    await queryInterface.addIndex('shortlink_schedules', ['end_time'], {
      name: 'idx_shortlink_schedules_end_time',
    });

    await queryInterface.addIndex(
      'shortlink_schedules',
      ['start_time', 'end_time'],
      {
        name: 'idx_shortlink_schedules_time_range',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shortlink_schedules');
  },
};
