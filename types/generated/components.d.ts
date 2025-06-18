import type { Schema, Struct } from '@strapi/strapi';

export interface TicketCompanion extends Struct.ComponentSchema {
  collectionName: 'components_ticket_companions';
  info: {
    displayName: 'Companion';
  };
  attributes: {
    companion_status: Schema.Attribute.Enumeration<
      ['confirmed', 'pending', 'cancelled']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    first_name: Schema.Attribute.String & Schema.Attribute.Required;
    last_name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface UserDisabilityCard extends Struct.ComponentSchema {
  collectionName: 'components_user_disability_cards';
  info: {
    displayName: 'Disability Card';
  };
  attributes: {
    card_status: Schema.Attribute.Enumeration<
      ['active', 'expired', 'pending', 'rejected']
    > &
      Schema.Attribute.DefaultTo<'pending'>;
    expiry_date: Schema.Attribute.Date;
    file: Schema.Attribute.Media<'images' | 'files'>;
    issuing_card: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'ticket.companion': TicketCompanion;
      'user.disability-card': UserDisabilityCard;
    }
  }
}
