-- Run AFTER schema.sql. This is your mock "Aadhaar registry" — 8 fake citizens
-- so you can demo registration, verification, and the duplicate-fraud case.
-- aadhaar_hash values below are the real SHA-256 hashes of the plaintext
-- Aadhaar numbers listed in the comment on each line — TYPE THE PLAINTEXT
-- NUMBER into your app's e-KYC form during the demo; the backend hashes it
-- with the same function (see security.py: hash_aadhaar) and matches here.

insert into citizens_registry (aadhaar_hash, aadhaar_last4, full_name, dob, gender, mobile_number) values
-- plaintext: 111122223333
('aeb221660ff09134bb3a46b295554820f5cdcaae8971d75d9ffa62468c850dca', '3333', 'Ramesh Patel', '1978-03-12', 'M', '9990000001'),
-- plaintext: 222233334444
('a6f4e2e473d011b58db800b7c6a56d6339cd9613da3b3e5c6988f9cc731e0be9', '4444', 'Sunita Patel', '1982-07-04', 'F', '9990000002'),
-- plaintext: 333344445555
('f451d32ef9a799233e588667c89843c961ed5c49bcfd7ad403710ae6773b40d7', '5555', 'Aarav Patel', '2010-11-20', 'M', '9990000003'),
-- plaintext: 444455556666
('8aeee14dfb6ff0cf24e7f0b0f46b3ae8f6327d66a8ada30b43a95c2163c11295', '6666', 'Meera Shah', '1990-01-15', 'F', '9990000004'),
-- plaintext: 555566667777
('e1b79717105657db72b5580e507269bb35db60dd85b199351bc37c011374e155', '7777', 'Kiran Shah', '2015-05-02', 'M', '9990000005'),
-- plaintext: 666677778888 -- reuse this SAME number when adding a member to a
-- second family during your demo to trigger the duplicate_flags fraud check.
('139849a1c0f7e46f4af4882f63bc98cd8602835072470f34d355a81b648caa0c', '8888', 'Priya Joshi', '2008-09-09', 'F', '9990000006'),
-- plaintext: 777788889999
('41c1ac8e76f991e41b94fe12d25ac1e7121f2b812d712d72c0ddde7a53a6ec19', '9999', 'Manoj Desai', '1975-02-28', 'M', '9990000007'),
-- plaintext: 888899990000
('b60d8feebfc4c6bde8b4451dba4d5bd47696ecafb24c683e32b89e7eea972e8c', '0000', 'Kavita Desai', '1979-06-18', 'F', '9990000008');

-- Seed schemes with eligibility rules AS DATA — this is what makes it a rule engine
insert into schemes (name, department, eligibility_rules, benefit_description) values
('Widow Pension Scheme', 'Social Justice & Empowerment',
  '{"max_income": 180000, "requires_widow": true}', 'Monthly pension for widows below poverty line'),
('Education Scholarship', 'Education Department',
  '{"max_income": 250000, "max_age": 25, "min_age": 6}', 'Annual scholarship for school/college-going children'),
('Ayushman-style Health Cover', 'Health Department',
  '{"max_income": 300000}', 'Cashless health insurance up to 5 lakh per family per year'),
('Agriculture Input Subsidy', 'Agriculture Department',
  '{"max_income": 200000, "requires_land_holding": true}', 'Subsidy on seeds and fertilizer for small farmers'),
('Disability Pension', 'Social Justice & Empowerment',
  '{"max_income": 180000, "requires_disability": true}', 'Monthly pension for persons with disability');

-- Seed officers so the officer login/review flow works in the demo
insert into officers (name, role, jurisdiction) values
('Amit Sharma', 'Talati', 'Ahmedabad'),
('Deepa Trivedi', 'Mamlatdar', 'Ahmedabad'),
('Rajesh Kumar', 'District Collector', 'Gujarat');
