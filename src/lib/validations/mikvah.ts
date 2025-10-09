import * as z from 'zod'

export const mikvahSubmissionSchema = z.object({
  name_en: z.string().min(2, 'Name must be at least 2 characters'),
  name_he: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().optional(),
  hours_of_operation: z.record(
    z.object({
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean().optional(),
    })
  ).optional(),
  price_info: z.string().optional(),
  mikvah_type: z.enum(['men_only', 'separate_hours', 'family']),
  directions_parking: z.string().optional(),
  accessibility_info: z.string().optional(),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed').optional(),
})

export type MikvahSubmissionData = z.infer<typeof mikvahSubmissionSchema>
