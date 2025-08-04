'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shortlinks', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      short_code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
        comment: 'Unique short code for the URL',
      },
      default_url: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'The original URL to redirect to',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether the shortlink is active',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiration date of the shortlink',
      },
      access_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum number of accesses allowed',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who created the shortlink',
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
    await queryInterface.addIndex('shortlinks', ['short_code'], {
      name: 'idx_shortlinks_short_code',
      unique: true,
    });

    await queryInterface.addIndex('shortlinks', ['user_id'], {
      name: 'idx_shortlinks_user_id',
    });

    await queryInterface.addIndex('shortlinks', ['expires_at'], {
      name: 'idx_shortlinks_expires_at',
    });

    await queryInterface.addIndex('shortlinks', ['is_active'], {
      name: 'idx_shortlinks_is_active',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shortlinks');
  },
};
