interface Breadcrumb {
    label: string;
    signal_field_name: string;
    value: string;
    display_name: string;
  }

  interface Pagination {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  }

  interface Phone {
    number: string;
    source: string;
  }

  interface ParentAccount {
    id: string;
    name: string;
  }

  interface TypedCustomFields {
    [key: string]: string | number;
  }

  interface ContactCampaignStatusTally {
    finished: number;
    paused: number;
    not_sent: number;
    active: number;
  }

  interface Account {
    id: string;
    name: string;
    website_url: string | null;
    blog_url: string | null;
    angellist_url: string | null;
    linkedin_url: string;
    twitter_url: string;
    facebook_url: string;
    primary_phone: Phone | null;
    languages: string[];
    alexa_ranking: number | null;
    phone: string | null;
    linkedin_uid: string;
    founded_year: number | null;
    publicly_traded_symbol: string | null;
    publicly_traded_exchange: string | null;
    logo_url: string;
    crunchbase_url: string | null;
    primary_domain: string | null;
    sanitized_phone: string;
    owned_by_organization_id: string | null;
    organization_raw_address: string;
    organization_city: string;
    organization_street_address: string;
    organization_state: string;
    organization_country: string;
    organization_postal_code: string;
    suggest_location_enrichment: boolean;
    parent_account: ParentAccount | null;
    domain: string;
    team_id: string;
    organization_id: string;
    account_stage_id: string;
    source: string;
    original_source: string;
    creator_id: string | null;
    owner_id: string;
    created_at: string;
    phone_status: string;
    hubspot_id: string | null;
    salesforce_id: string | null;
    crm_owner_id: string | null;
    parent_account_id: string | null;
    account_playbook_statuses: string[];
    account_rule_config_statuses: string[];
    existence_level: string;
    label_ids: string[];
    typed_custom_fields: TypedCustomFields;
    modality: string;
    salesforce_record_url: string | null;
    contact_emailer_campaign_ids: string[];
    contact_campaign_status_tally: ContactCampaignStatusTally;
    num_contacts: number;
    last_activity_date: string;
    intent_strength: string | null;
    show_intent: boolean;
  }

  interface ApolloResponse {
    breadcrumbs: Breadcrumb[];
    partial_results_only: boolean;
    disable_eu_prospecting: boolean;
    partial_results_limit: number;
    pagination: Pagination;
    accounts: Account[];
    organizations: string[];
    model_ids: string[];
    num_fetch_result: string | null;
    derived_params: {
      recommendation_config_id: string;
    };
  }

export type Person = {
    id: string;
    created_at?: string;
    first_name: string;
    last_name: string;
    name: string;
    linkedin_url: string;
    title: string;
    photo_url: string;
    twitter_url: string | null;
    github_url: string | null;
    facebook_url: string | null;
    state: string;
    city: string;
    country: string;
    organization_id: string;
    organization: Organization;
    email: string;
  }
export interface Organization {
    id: string;
    created_at?: string;
    name: string;
    website_url: string | null;
    linkedin_url: string;
    twitter_url: string | null;
    facebook_url: string | null;
    sanitized_phone: string;
    hires_in?: string[];
    logo_url: string;
    emails: string[];
    phone: string;
    people?: Person[];
    user_organizations?: any[];
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  }
export type {
    ApolloResponse,
    Breadcrumb,
    Pagination,
    Phone,
    ParentAccount,
    TypedCustomFields,
    ContactCampaignStatusTally,
    Account,
};

