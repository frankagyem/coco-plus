-- Sample data for local development. Safe to re-run: existing rows are left alone.

insert into categories (name, slug, type) values
  ('Dresses', 'dresses', 'physical'),
  ('Tops & Blouses', 'tops-blouses', 'physical'),
  ('Trousers & Skirts', 'trousers-skirts', 'physical'),
  ('Outerwear', 'outerwear', 'physical'),
  ('Accessories', 'accessories', 'physical')
on conflict (slug) do nothing;

insert into delivery_areas (name, fee, is_free)
select v.name, v.fee, v.is_free
from (values
  ('Accra (Greater Accra)', 0.00,   true),
  ('Tema',                  25.00,  false),
  ('Kumasi',                40.00,  false),
  ('Takoradi',              60.00,  false),
  ('Cape Coast',            55.00,  false),
  ('Tamale',                80.00,  false),
  ('Other Ghana',           100.00, false)
) as v(name, fee, is_free)
where not exists (select 1 from delivery_areas d where d.name = v.name);

insert into products (name, slug, description, category_id, price, sale_price, fabric, occasion, sku, status, is_featured, is_new_arrival, is_pre_order)
select v.name, v.slug, v.description, c.id, v.price, v.sale_price, v.fabric, v.occasion, v.sku, 'ACTIVE', v.featured, v.new_arrival, v.pre_order
from (values
  ('Ankara Max Dress',         'ankara-max-dress',         'Floor-length handwoven Ankara maxi with a fitted bodice and side tie.',      'dresses',         420.00, 350.00, 'Ankara',       'Wedding',     'COCO-DR-001', true,  true,  false),
  ('Kente Two-Piece Set',       'kente-two-piece-set',      'Matching kente blouse and wrapper skirt with hand-stitched trim.',            'dresses',         680.00, null,   'Kente',        'Wedding',     'COCO-DR-002', true,  false, false),
  ('Lace Midi Gown',            'lace-midi-gown',           'Scalloped lace gown with a fitted waist and covered buttons.',                'dresses',         750.00, 690.00, 'Cotton Lace',  'Prom',        'COCO-DR-003', true,  false, false),
  ('Adinkra Print Jumpsuit',    'adinkra-print-jumpsuit',   'Full-length jumpsuit in authentic Adinkra print with wide-leg trousers.',    'dresses',         380.00, null,   'Cotton',       'Casual',      'COCO-DR-004', false, true,  false),
  ('Pleated Tunic Blouse',      'pleated-tunic-blouse',     'Boxy pleated tunic blouse in breathable cotton, pairs with wrapper skirts.', 'tops-blouses',    165.00, 140.00, 'Cotton',       'Casual',      'COCO-TP-001', false, true,  false),
  ('Embroidered Blouse',        'embroidered-blouse',       'Hand-embroidered puff-sleeve blouse in soft rayon.',                          'tops-blouses',    195.00, null,   'Rayon',        'Office',      'COCO-TP-002', true,  false, false),
  ('Satin Camisole',            'satin-camisole',           'Bias-cut satin camisole with adjustable straps.',                              'tops-blouses',    120.00, null,   'Satin',        'Evening',     'COCO-TP-003', false, false, false),
  ('Kente Wrap Skirt',          'kente-wrap-skirt',         'Mid-length wrap skirt in traditional kente with a concealed zip.',           'trousers-skirts', 230.00, 200.00, 'Kente',        'Traditional', 'COCO-TR-001', true,  false, false),
  ('Wide-Leg Trousers',         'wide-leg-trousers',        'High-waisted wide-leg trousers with pleats and side pockets.',                 'trousers-skirts', 175.00, null,   'Cotton Twill', 'Office',      'COCO-TR-002', false, true,  false),
  ('Fitted Midi Skirt',         'fitted-midi-skirt',        'Stretch fitted midi skirt with a concealed side zip.',                         'trousers-skirts', 130.00, null,   'Jersey',       'Casual',      'COCO-TR-003', false, false, false),
  ('Embroidered Kaftan',        'embroidered-kaftan',       'Longline kaftan with hand embroidery down the front panel.',                  'outerwear',       540.00, 495.00, 'Cotton',       'Traditional', 'COCO-OW-001', true,  false, false),
  ('Tailored Blazer',           'tailored-blazer',          'Structured single-breasted blazer in a wool-blend suiting.',                   'outerwear',       320.00, null,   'Wool Blend',   'Office',      'COCO-OW-002', false, true,  false),
  ('Wax Print Wrap',            'wax-print-wrap',           'Six-yard wax print wrap, pre-washed and colourfast.',                          'accessories',      85.00, null,   'Cotton',       'Casual',      'COCO-AC-001', false, false, false),
  ('Beaded Statement Necklace', 'beaded-statement-necklace', 'Hand-strung glass beads with a brass clasp.',                                 'accessories',      70.00, 55.00,  'Glass',        'Evening',     'COCO-AC-002', false, true,  false)
) as v(name, slug, description, category_slug, price, sale_price, fabric, occasion, sku, featured, new_arrival, pre_order)
join categories c on c.slug = v.category_slug
on conflict (sku) do nothing;

insert into product_variants (product_id, size, color, stock_quantity)
select p.id, v.size, v.color, v.stock
from (values
  ('ankara-max-dress',          'S',       'Multi',         8),
  ('ankara-max-dress',          'M',       'Multi',         12),
  ('ankara-max-dress',          'L',       'Multi',         6),
  ('ankara-max-dress',          'XL',      'Multi',         4),
  ('kente-two-piece-set',       'S',       'Gold/Black',    5),
  ('kente-two-piece-set',       'M',       'Gold/Black',    9),
  ('kente-two-piece-set',       'L',       'Gold/Black',    7),
  ('lace-midi-gown',            'S',       'Ivory',         6),
  ('lace-midi-gown',            'M',       'Ivory',         10),
  ('lace-midi-gown',            'L',       'Ivory',         4),
  ('adinkra-print-jumpsuit',    'S',       'Black/White',   7),
  ('adinkra-print-jumpsuit',    'M',       'Black/White',   11),
  ('adinkra-print-jumpsuit',    'L',       'Black/White',   5),
  ('pleated-tunic-blouse',      'S',       'Sand',          10),
  ('pleated-tunic-blouse',      'M',       'Sand',          14),
  ('pleated-tunic-blouse',      'L',       'Sand',          8),
  ('embroidered-blouse',        'M',       'Cream',         9),
  ('embroidered-blouse',        'L',       'Cream',         6),
  ('satin-camisole',            'S',       'Champagne',     12),
  ('satin-camisole',            'M',       'Champagne',     9),
  ('kente-wrap-skirt',          'S',       'Gold/Black',    8),
  ('kente-wrap-skirt',          'M',       'Gold/Black',    13),
  ('kente-wrap-skirt',          'L',       'Gold/Black',    7),
  ('wide-leg-trousers',         'S',       'Charcoal',      10),
  ('wide-leg-trousers',         'M',       'Charcoal',      15),
  ('wide-leg-trousers',         'L',       'Charcoal',      9),
  ('fitted-midi-skirt',         'S',       'Black',         11),
  ('fitted-midi-skirt',         'M',       'Black',         14),
  ('embroidered-kaftan',        'L',       'Indigo',        6),
  ('embroidered-kaftan',        'XL',      'Indigo',        5),
  ('embroidered-kaftan',        'XXL',     'Indigo',        3),
  ('tailored-blazer',           'S',       'Navy',          8),
  ('tailored-blazer',           'M',       'Navy',          12),
  ('tailored-blazer',           'L',       'Navy',          7),
  ('wax-print-wrap',            'One Size','Indigo',        20),
  ('beaded-statement-necklace', 'One Size','Multi',         16)
) as v(slug, size, color, stock)
join products p on p.slug = v.slug
where not exists (
  select 1 from product_variants pv
  where pv.product_id = p.id and pv.size = v.size and pv.color = v.color
);

insert into product_images (product_id, image_url, is_primary, display_order)
select p.id, v.image_url, true, 0
from (values
  ('ankara-max-dress',          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900'),
  ('kente-two-piece-set',       'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900'),
  ('lace-midi-gown',            'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900'),
  ('adinkra-print-jumpsuit',    'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=900'),
  ('pleated-tunic-blouse',      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900'),
  ('embroidered-blouse',        'https://images.unsplash.com/photo-1564257577054-9920b3e1b1e0?w=900'),
  ('satin-camisole',            'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=900'),
  ('kente-wrap-skirt',          'https://images.unsplash.com/photo-1583496661160-fb5886a13d27?w=900'),
  ('wide-leg-trousers',         'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=900'),
  ('fitted-midi-skirt',         'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=900'),
  ('embroidered-kaftan',        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900'),
  ('tailored-blazer',           'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900'),
  ('wax-print-wrap',            'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900'),
  ('beaded-statement-necklace', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900')
) as v(slug, image_url)
join products p on p.slug = v.slug
where not exists (
  select 1 from product_images pi where pi.product_id = p.id and pi.image_url = v.image_url
);
