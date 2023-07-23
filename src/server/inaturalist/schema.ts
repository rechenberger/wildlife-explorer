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
  atlas_id: z.any(),
  ancestor_ids: z.array(z.number()),
  ancestry: z.string(),
  complete_species_count: z.any(),
  created_at: z.string().optional(),
  current_synonymous_taxon_ids: z.any(),
  default_photo: z
    .object({
      id: z.number(),
      license_code: z.any(),
      attribution: z.string(),
      url: z.string(),
      original_dimensions: z.object({}),
      flags: z.array(z.any()),
      square_url: z.string(),
      medium_url: z.string(),
    })
    .nullable(),
  endemic: z.boolean().optional(),
  english_common_name: z.string().optional(),
  extinct: z.boolean().optional(),
  flag_counts: z.object({ resolved: z.number(), unresolved: z.number() }),
  iconic_taxon_id: z.number(),
  iconic_taxon_name: z.string(),
  id: z.number(),
  introduced: z.boolean().optional(),
  is_active: z.boolean(),
  min_species_ancestry: z.string().optional(),
  min_species_taxon_id: z.number().optional(),
  name: z.string(),
  native: z.boolean().optional(),
  observations_count: z.number(),
  parent_id: z.number(),
  photos_locked: z.boolean(),
  preferred_common_name: z.string().optional(),
  rank_level: z.number(),
  rank: z.string(),
  taxon_changes_count: z.number(),
  taxon_schemes_count: z.number(),
  threatened: z.boolean().optional(),
  universal_search_rank: z.number().optional(),
  wikipedia_url: z.string().nullable(),
})

export const User = z.object({
  activity_count: z.number(),
  created_at: z.string(),
  icon_url: z.string().nullable(),
  icon: z.string().nullable(),
  id: z.number(),
  identifications_count: z.number(),
  journal_posts_count: z.number(),
  login_autocomplete: z.string(),
  login_exact: z.string(),
  login: z.string(),
  name_autocomplete: z.string().nullable(),
  name: z.string().nullable(),
  observations_count: z.number(),
  orcid: z.any(),
  preferences: z.object({}).optional(),
  roles: z.array(z.any()),
  site_id: z.number().nullable(),
  spam: z.boolean(),
  species_count: z.number(),
  suspended: z.boolean(),
  universal_search_rank: z.number(),
})

export const AnnotationSchema = z.object({
  concatenated_attr_val: z.string(),
  controlled_attribute_id: z.number(),
  controlled_value_id: z.number(),
  user_id: z.number(),
  user: User,
  uuid: z.string(),
  vote_score: z.number(),
  votes: z.array(z.any()),
})

export const Observation = z.object({
  annotations: z.array(AnnotationSchema).optional(),
  cached_votes_total: z.number(),
  captive: z.boolean(),
  comments_count: z.number(),
  comments: z.array(z.any()),
  community_taxon_id: z.any(),
  created_at_details: DateDetails,
  created_at: z.string(),
  created_time_zone: z.string(),
  description: z.string().nullable(),
  faves_count: z.number(),
  faves: z.array(z.any()),
  flags: z.array(z.any()),
  geojson: z.object({ coordinates: z.array(z.number()), type: z.string() }),
  geoprivacy: z.string().nullable(),
  id: z.number(),
  ident_taxon_ids: z.array(z.number()),
  identifications_count: z.number(),
  identifications_most_agree: z.boolean(),
  identifications_most_disagree: z.boolean(),
  identifications_some_agree: z.boolean(),
  identifications: z.array(z.any()),
  license_code: z.string().nullable(),
  location: z.string(),
  map_scale: z.any(),
  mappable: z.boolean(),
  non_owner_ids: z.array(z.any()),
  num_identification_agreements: z.number(),
  num_identification_disagreements: z.number(),
  oauth_application_id: z.number().nullable(),
  obscured: z.boolean(),
  observation_photos: z.array(z.any()),
  observed_on_details: DateDetails.nullable(),
  observed_on_string: z.string().nullable(),
  observed_on: z.string().nullable(),
  observed_time_zone: z.string(),
  ofvs: z.array(z.any()),
  outlinks: z.array(z.any()),
  owners_identification_from_vision: z.boolean().nullable(),
  photos: z.array(
    z.object({
      id: z.number(),
      license_code: z.string().nullable(),
      original_dimensions: z.object({ width: z.number(), height: z.number() }),
      url: z.string(),
      attribution: z.string(),
      flags: z.array(z.any()),
    })
  ),
  place_guess: z.any(),
  place_ids: z.array(z.number()),
  positional_accuracy: z.number().nullable(),
  preferences: z.object({ prefers_community_taxon: z.any() }),
  project_ids_with_curator_id: z.array(z.any()),
  project_ids_without_curator_id: z.array(z.any()),
  project_ids: z.array(z.any()),
  project_observations: z.array(z.any()),
  public_positional_accuracy: z.number().nullable(),
  quality_grade: z.string(),
  quality_metrics: z.array(z.any()),
  reviewed_by: z.array(z.number()),
  site_id: z.number().nullable(),
  sounds: z.array(z.any()),
  spam: z.boolean(),
  species_guess: z.any(),
  tags: z.array(z.any()),
  taxon_geoprivacy: z.any(),
  taxon: Taxon,
  time_observed_at: z.string().nullable(),
  time_zone_offset: z.string(),
  updated_at: z.string(),
  uri: z.string(),
  user: User,
  uuid: z.string(),
  votes: z.array(z.any()),
})
