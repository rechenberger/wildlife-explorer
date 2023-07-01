import { z } from "zod"

export const DateDetails = z.object({
  date: z.string(),
  week: z.number(),
  month: z.number(),
  hour: z.number(),
  year: z.number(),
  day: z.number(),
})

export const Taxon = z.object({
  is_active: z.boolean(),
  ancestry: z.string(),
  min_species_ancestry: z.string(),
  endemic: z.boolean(),
  iconic_taxon_id: z.number(),
  min_species_taxon_id: z.number(),
  threatened: z.boolean(),
  rank_level: z.number(),
  introduced: z.boolean(),
  native: z.boolean(),
  parent_id: z.number(),
  name: z.string(),
  rank: z.string(),
  extinct: z.boolean(),
  id: z.number(),
  ancestor_ids: z.array(z.number()),
  photos_locked: z.boolean(),
  taxon_schemes_count: z.number(),
  wikipedia_url: z.string().nullable(),
  current_synonymous_taxon_ids: z.any(),
  created_at: z.string(),
  taxon_changes_count: z.number(),
  complete_species_count: z.any(),
  universal_search_rank: z.number(),
  observations_count: z.number(),
  flag_counts: z.object({
    resolved: z.number(),
    unresolved: z.number(),
  }),
  atlas_id: z.any(),
  default_photo: z.object({
    id: z.number(),
    license_code: z.any(),
    attribution: z.string(),
    url: z.string(),
    original_dimensions: z.object({}),
    flags: z.array(z.any()),
    square_url: z.string(),
    medium_url: z.string(),
  }),
  iconic_taxon_name: z.string(),
})

export const User = z.object({
  site_id: z.number().nullable(),
  created_at: z.string(),
  id: z.number(),
  login: z.string(),
  spam: z.boolean(),
  suspended: z.boolean(),
  login_autocomplete: z.string(),
  login_exact: z.string(),
  name: z.string().nullable(),
  name_autocomplete: z.string().nullable(),
  orcid: z.any(),
  icon: z.string().nullable(),
  observations_count: z.number(),
  identifications_count: z.number(),
  journal_posts_count: z.number(),
  activity_count: z.number(),
  species_count: z.number(),
  universal_search_rank: z.number(),
  roles: z.array(z.any()),
  icon_url: z.string().nullable(),
  preferences: z.object({}),
})

export const Observation = z.object({
  quality_grade: z.string(),
  time_observed_at: z.string(),
  taxon_geoprivacy: z.any(),
  annotations: z.array(z.any()),
  uuid: z.string(),
  observed_on_details: DateDetails,
  id: z.number(),
  cached_votes_total: z.number(),
  identifications_most_agree: z.boolean(),
  created_at_details: DateDetails,
  species_guess: z.any(),
  identifications_most_disagree: z.boolean(),
  tags: z.array(z.any()),
  positional_accuracy: z.number().nullable(),
  comments_count: z.number(),
  site_id: z.number().nullable(),
  created_time_zone: z.string(),
  license_code: z.string().nullable(),
  observed_time_zone: z.string(),
  quality_metrics: z.array(z.any()),
  public_positional_accuracy: z.number().nullable(),
  reviewed_by: z.array(z.number()),
  oauth_application_id: z.number().nullable(),
  flags: z.array(z.any()),
  created_at: z.string(),
  description: z.string().nullable(),
  time_zone_offset: z.string(),
  project_ids_with_curator_id: z.array(z.any()),
  observed_on: z.string(),
  observed_on_string: z.string(),
  updated_at: z.string(),
  sounds: z.array(z.any()),
  place_ids: z.array(z.number()),
  captive: z.boolean(),
  taxon: Taxon,
  ident_taxon_ids: z.array(z.number()),
  outlinks: z.array(z.any()),
  faves_count: z.number(),
  ofvs: z.array(z.any()),
  num_identification_agreements: z.number(),
  preferences: z.object({
    prefers_community_taxon: z.any(),
  }),
  comments: z.array(z.any()),
  map_scale: z.any(),
  uri: z.string(),
  project_ids: z.array(z.any()),
  community_taxon_id: z.any(),
  geojson: z.object({
    coordinates: z.array(z.number()),
    type: z.string(),
  }),
  owners_identification_from_vision: z.boolean().nullable(),
  identifications_count: z.number(),
  obscured: z.boolean(),
  num_identification_disagreements: z.number(),
  geoprivacy: z.string().nullable(),
  location: z.string(),
  votes: z.array(z.any()),
  spam: z.boolean(),
  user: User,
  mappable: z.boolean(),
  identifications_some_agree: z.boolean(),
  project_ids_without_curator_id: z.array(z.any()),
  place_guess: z.any(),
  identifications: z.array(z.any()),
  project_observations: z.array(z.any()),
  observation_photos: z.array(z.any()),
  photos: z.array(z.any()),
  faves: z.array(z.any()),
  non_owner_ids: z.array(z.any()),
})
