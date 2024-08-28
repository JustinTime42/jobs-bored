export interface EmploymentHistory {
    _id: string;
    created_at: string;
    current: boolean;
    degree: string | null;
    description: string | null;
    emails: string | null;
    end_date: string | null;
    grade_level: string | null;
    kind: string | null;
    major: string | null;
    organization_id: string | null;
    organization_name: string | null;
    raw_address: string | null;
    start_date: string;
    title: string;
    updated_at: string;
    id: string;
    key: string;
  }
  
  export interface PrimaryPhone {
    number: string;
    source: string;
  }
  
  export interface Organization {
    id: string;
    created_at?: string;
    name: string;
    website_url: string | null;
    linkedin_url: string;
    twitter_url: string | null;
    facebook_url: string | null;
    primary_phone: string;    
    hires_in?: string[];
    logo_url: string;
    emails: string[];
    phone: string;
    people?: Person[];
  }
  
  export interface Account {
    id: string;
    name: string;
    website_url: string;
    blog_url: string | null;
    angellist_url: string | null;
    linkedin_url: string;
    twitter_url: string | null;
    facebook_url: string | null;
    primary_phone: PrimaryPhone;
    languages: string[];
    alexa_ranking: number;
    phone: string;
    linkedin_uid: string;
    founded_year: number;
    publicly_traded_symbol: string | null;
    publicly_traded_exchange: string | null;
    logo_url: string;
    crunchbase_url: string | null;
    primary_domain: string;
    persona_counts: Record<string, unknown>;
    domain: string;
    team_id: string;
    organization_id: string;
    account_stage_id: string;
    source: string;
    original_source: string;
    owner_id: string | null;
    created_at: string;
    phone_status: string;
    test_predictive_score: string | null;
    hubspot_id: string;
    salesforce_id: string | null;
    crm_owner_id: string;
    parent_account_id: string | null;
    sanitized_phone: string;
    account_playbook_statuses: string[];
    existence_level: string;
    label_ids: string[];
    typed_custom_fields: Record<string, unknown>;
    modality: string;
    hubspot_record_url: string;
    salesloft_id: string;
    salesloft_url: string;
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
  }
  
export interface ApolloResponse {
    breadcrumbs: {
      label: string;
      signal_field_name: string;
      value: string | string[];
      display_name: string;
    }[];
    partial_results_only: boolean;
    disable_eu_prospecting: boolean;
    partial_results_limit: number;
    pagination: {
      page: number;
      per_page: number;
      total_entries: number;
      total_pages: number;
    };
    contacts: any[];
    people: Person[];
  }
  