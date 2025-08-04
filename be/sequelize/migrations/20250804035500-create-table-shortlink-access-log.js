'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shortlink_access_logs', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      accessed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'When the shortlink was accessed',
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: 'IP address of the user who accessed the link',
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent string from the browser',
      },
      referrer: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Referrer URL if available',
      },
      country: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Country derived from IP address',
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
        comment: 'Shortlink that was accessed',
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
    await queryInterface.addIndex('shortlink_access_logs', ['shortlink_id'], {
      name: 'idx_shortlink_access_logs_shortlink_id',
    });

    await queryInterface.addIndex('shortlink_access_logs', ['accessed_at'], {
      name: 'idx_shortlink_access_logs_accessed_at',
    });

    await queryInterface.addIndex('shortlink_access_logs', ['ip_address'], {
      name: 'idx_shortlink_access_logs_ip_address',
    });

    await queryInterface.addIndex('shortlink_access_logs', ['country'], {
      name: 'idx_shortlink_access_logs_country',
    });

    await queryInterface.addIndex(
      'shortlink_access_logs',
      ['shortlink_id', 'accessed_at'],
      {
        name: 'idx_shortlink_access_logs_link_time',
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shortlink_access_logs');
  },
};
