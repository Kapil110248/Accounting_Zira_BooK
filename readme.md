
model users {
  id            Int        @id @default(autoincrement())
  company_id    Int?
  name          String?    @db.VarChar(255)
  email         String     @unique @db.VarChar(150)  
  password      String?    @db.VarChar(255)
  Start_date    Date?       
  Expire_date   Date?
  status        String?    @db.VarChar(255)
  image         String?    @db.VarChar(500)
  role          Role       @default(EMPLOYEE)
  created_at    DateTime   @default(now()) @db.Timestamp(0)
  company       companies? @relation(fields: [company_id], references: [id])
}

enum Role {
  SUPER_ADMIN
  COMPANY
  EMPLOYEE
}


model subgroups {
  id         Int          @id @default(autoincrement())
  company_id Int?         // ✅ Links to the companies table
  category_id Int 
  name       String       @db.VarChar(255) // ✅ Required
  created_at DateTime     @default(now()) @db.Timestamp(0)
  deleted_at DateTime? @db.Timestamp(0)
  // Relations
  company    companies?   @relation(fields: [company_id], references: [id], onDelete: Cascade) // ✅ Relation to company
  category    categories   @relation(fields: [category_id], references: [id], onDelete: Cascade)
  accounts   accounts[]
}

model accounts {
  id               Int        @id @default(autoincrement())
  subgroup_id      Int?
  company_id       Int?
  account_name     String?    @db.VarChar(100)
  has_bank_details String?    @db.VarChar(255)
  account_number   String?    @db.VarChar(255)
  ifsc_code        String?    @db.VarChar(20)
  bank_name_branch String?    @db.VarChar(255)
  created_at       DateTime   @default(now()) @db.Timestamp(0)
  deleted_at DateTime? @db.Timestamp(0)
  subgroups        subgroups? @relation(fields: [subgroup_id], references: [id])
  company    companies?   @relation(fields: [company_id], references: [id])
  // ✅ Add these reverse relations for contra_vouchers
  from_contra_vouchers contra_vouchers[] @relation("FromAccount")
  to_contra_vouchers   contra_vouchers[] @relation("ToAccount")
  @@index([subgroup_id], map: "accounts_subgroup_id_fkey")
}

model vouchers {
  id                  Int                   @id @default(autoincrement())
  company_id          Int
  voucher_type        String                @db.VarChar(50)
  voucher_number      String                @db.VarChar(100)
  date                DateTime              @db.Date
  from_name           String?               @db.VarChar(255)
  from_email          String?               @db.VarChar(255)
  from_phone          String?               @db.VarChar(50)
  from_address        String?               @db.Text
  notes               String?               @db.Text
  logo_url            String?               @db.VarChar(255)
  signature_url       String?               @db.VarChar(255)
  status              String?               @default("Pending") @db.VarChar(50)
  created_at          DateTime              @default(now()) @db.Timestamp(0)
  updated_at          DateTime              @default(now()) @db.Timestamp(0)
  to_name             String?               @db.VarChar(255)
  transfer_amount     Int?
  from_account        Int?
  to_account          Int?
  customer_id         Int?
  vendor_id           Int?
  manual_voucher_no   String?               @db.VarChar(255)
  voucher_attachments voucher_attachments[]
  voucher_items       voucher_items[]
  voucher_payments    voucher_payments[]
}

model transactions {
  id             Int      @id @default(autoincrement())
  date           String?  @db.VarChar(255)
  company_id     Int?
  transaction_id String?  @db.VarChar(50)
  balance_type   String?  @db.VarChar(255)
  voucher_type   String?  @db.VarChar(100)
  voucher_no     String?  @db.VarChar(100)
  amount         Decimal? @db.Decimal(15, 2)
  from_type      String?  @db.VarChar(255)
  from_id        Int?
  account_type   String?  @db.VarChar(255)
  note           String?  @db.Text
  created_at     DateTime @default(now()) @db.Timestamp(0)

  // ✅ Add these relations
  company companies? @relation(fields: [company_id], references: [id])
}

model voucher_items {
  id          Int      @id @default(autoincrement())
  voucher_id  Int
  item_name   String   @db.VarChar(255)
  description String?  @db.Text
  hsn_code    String?  @db.VarChar(50)
  quantity    Decimal? @default(1.00) @db.Decimal(10, 2)
  rate        Decimal? @db.Decimal(10, 2)
  amount      Decimal? @db.Decimal(10, 2)
  tax_type    String?  @default("None") @db.VarChar(20)
  tax_rate    Decimal? @default(0.00) @db.Decimal(5, 2)
  tax_amount  Decimal? @default(0.00) @db.Decimal(10, 2)
  vouchers    vouchers @relation(fields: [voucher_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "voucher_items_ibfk_1")

  @@index([voucher_id], map: "voucher_id")
}


model categories {
  id         Int          @id @default(autoincrement())
  company_id Int          // ✅ Links to the companies table
  name       String       @db.VarChar(100) // ✅ Required
  created_at DateTime     @default(now()) @db.Timestamp(0)
   deleted_at DateTime?    @db.Timestamp(0)

  // Relations
  company    companies    @relation(fields: [company_id], references: [id], onDelete: Cascade) // ✅ Relation to company
  subgroups  subgroups[] // ✅ Many-to-many relation with subgroups
}

/// The underlying table does not contain a valid unique identifier and can therefore currently not be handled by Prisma Client.
model contra_vouchers {
  id                Int      @id @default(autoincrement())
  voucher_no_auto   String   @db.VarChar(50)
  voucher_no_manual String?  @db.VarChar(50)
  voucher_date      DateTime @db.Date
  account_from_id   Int
  account_to_id     Int
  amount            Decimal  @db.Decimal(12, 2)
  document          String?  @db.VarChar(255)
  narration         String?  @db.Text
  created_at        DateTime @default(now()) @db.Timestamp(0)

  // ✅ Add explicit relation names
  account_from accounts @relation(name: "FromAccount", fields: [account_from_id], references: [id])
  account_to   accounts @relation(name: "ToAccount", fields: [account_to_id], references: [id])
}

model customers {
  id                  Int      @id @default(autoincrement())
  company_id          Int
  name_english        String?  @db.VarChar(255)
  name_arabic         String?  @db.VarChar(255)
  company_name        String?  @db.VarChar(255)
  google_location     String?  @db.VarChar(500)
  id_card_image       String?  @db.VarChar(500)
  image               String?  @db.VarChar(500)
  account_type        String?  @db.VarChar(100)
  balance_type        String?  @db.VarChar(50)
  account_name        String?  @db.VarChar(255)
  account_balance     Decimal? @db.Decimal(15, 2)
  creation_date       String?  @db.VarChar(255)
  bank_account_number String?  @db.VarChar(100)
  bank_ifsc           String?  @db.VarChar(50)
  bank_name_branch    String?  @db.VarChar(255)
  country             String?  @db.VarChar(100)
  state               String?  @db.VarChar(100)
  pincode             String?  @db.VarChar(20)
  address             String?  @db.Text
  state_code          String?  @db.VarChar(50)
  shipping_address    String?  @db.Text
  phone               String?  @db.VarChar(50)
  email               String?  @db.VarChar(150)
  credit_period       Int?
  gstin               String?  @db.VarChar(50)
  enable_gst          Boolean  @default(false)
  created_at          DateTime @default(now()) @db.Timestamp(0)
}

model income_vouchers {
  id                     Int                      @id @default(autoincrement())
  company_id             Int
  auto_receipt_no        String                   @unique(map: "auto_receipt_no") @db.VarChar(50)
  manual_receipt_no      String?                  @db.VarChar(50)
  voucher_date           DateTime                 @db.Date
  deposited_to           String                   @db.VarChar(100)
  received_from          Int?
  total_amount           Decimal                  @default(0.00) @db.Decimal(12, 2)
  narration              String?                  @db.Text
  status                 String?                  @default("pending") @db.VarChar(255)
  created_at             DateTime                 @default(now()) @db.Timestamp(0)
  updated_at             DateTime                 @default(now()) @db.Timestamp(0)
  income_voucher_entries income_voucher_entries[]
}

model modules {
  id           Int            @id @default(autoincrement())
  key          String         @unique(map: "key") @db.VarChar(50)
  label        String         @db.VarChar(100)
  created_at   DateTime       @default(now()) @db.Timestamp(0)
  plan_modules plan_modules[]
}

model products {
  id               Int              @id @default(autoincrement())
  company_id       Int?
  warehouse_id     Int?
  item_category_id Int?
  item_name        String?          @db.VarChar(255)
  hsn              String?          @db.VarChar(100)
  barcode          String?          @db.VarChar(100)
  sku              String?          @db.VarChar(100)
  description      String?          @db.Text
  initial_qty      Int?
  min_order_qty    Int?
  as_of_date       String?          @db.VarChar(255)
  initial_cost     Decimal?         @db.Decimal(15, 2)
  sale_price       Decimal?         @db.Decimal(15, 2)
  purchase_price   Decimal?         @db.Decimal(15, 2)
  discount         Decimal?         @db.Decimal(5, 2)
  tax_account      String?          @db.VarChar(255)
  remarks          String?          @db.Text
  image            String?          @db.VarChar(500)
  created_at       DateTime         @default(now()) @db.Timestamp(0)
  transfer_items   transfer_items[]
}


model sales_order_items {
  id             Int          @id @default(autoincrement())
  sales_order_id Int
  product_id     Int?
  item_name      String?      @db.VarChar(255)
  qty            Decimal?     @default(1.00) @db.Decimal(10, 2)
  rate           Decimal?     @default(0.00) @db.Decimal(12, 2)
  tax_percent    Decimal?     @default(0.00) @db.Decimal(5, 2)
  discount       Decimal?     @default(0.00) @db.Decimal(12, 2)
  amount         Decimal?     @default(0.00) @db.Decimal(12, 2)
  sales_orders   sales_orders @relation(fields: [sales_order_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "sales_order_items_ibfk_1")

  @@index([sales_order_id], map: "sales_order_id")
}

model services {
  id               Int      @id @default(autoincrement())
  company_id       Int?
  service_name     String?  @db.VarChar(255)
  sku              String?  @db.VarChar(100)
  description      String?  @db.Text
  uom              String?  @db.VarChar(100)
  price            Decimal? @db.Decimal(15, 2)
  tax_percent      Decimal? @db.Decimal(5, 2)
  allow_in_invoice String?  @db.VarChar(255)
  remarks          String?  @db.Text
  created_at       DateTime @default(now()) @db.Timestamp(0)
}

model vendors {
  id                  Int      @id @default(autoincrement())
  company_id          Int?
  name_english        String?  @db.VarChar(255)
  name_arabic         String?  @db.VarChar(255)
  company_name        String?  @db.VarChar(255)
  google_location     String?  @db.VarChar(500)
  id_card_image       String?  @db.VarChar(500)
  image               String?  @db.VarChar(500)
  account_type        String?  @db.VarChar(100)
  balance_type        String?  @db.VarChar(50)
  account_name        String?  @db.VarChar(255)
  account_balance     Decimal? @db.Decimal(15, 2)
  creation_date       String?  @db.VarChar(255)
  bank_account_number String?  @db.VarChar(100)
  bank_ifsc           String?  @db.VarChar(50)
  bank_name_branch    String?  @db.VarChar(255)
  country             String?  @db.VarChar(100)
  state               String?  @db.VarChar(100)
  pincode             String?  @db.VarChar(255)
  address             String?  @db.Text
  state_code          String?  @db.VarChar(50)
  shipping_address    String?  @db.Text
  phone               String?  @db.VarChar(50)
  email               String?  @db.VarChar(150)
  credit_period       Int?
  enable_gst          String?  @db.VarChar(255)
  gstin               String?  @db.VarChar(255)
  created_at          DateTime @default(now()) @db.Timestamp(0)
}

model warehouses {
  id             Int              @id @default(autoincrement())
  company_id     Int?
  warehouse_name String?          @db.VarChar(255)
  location       String?          @db.VarChar(255)
  created_at     DateTime         @default(now()) @db.Timestamp(0)
  transfer_items transfer_items[]
}

model adjustment_items {
  id            Int         @id @default(autoincrement())
  adjustment_id Int
  product_id    Int
  warehouse_id  Int
  quantity      Decimal     @db.Decimal(10, 2)
  rate          Decimal?    @default(0.00) @db.Decimal(10, 2)
  narration     String?     @db.Text
  adjustments   adjustments @relation(fields: [adjustment_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "adjustment_items_ibfk_1")

  @@index([adjustment_id], map: "adjustment_id")
}

model adjustments {
  id                Int                         @id @default(autoincrement())
  company_id        Int
  voucher_no        String                      @db.VarChar(50)
  manual_voucher_no String?                     @db.VarChar(50)
  adjustment_type   adjustments_adjustment_type
  adjustment_date   DateTime                    @db.Date
  notes             String?                     @db.Text
  created_at        DateTime                    @default(now()) @db.Timestamp(0)
  adjustment_items  adjustment_items[]
  companies         companies                   @relation(fields: [company_id], references: [id], onUpdate: Restrict, map: "adjustments_ibfk_1")

  @@index([company_id], map: "company_id")
}

model companies {
  id            Int               @id @default(autoincrement())
  name          String            @db.VarChar(150)
  email         String            @unique(map: "email") @db.VarChar(120)
  password_hash String            @db.VarChar(255)
  start_date    DateTime?         @db.Date
  expire_date   DateTime?         @db.Date
  plan_id       Int
  plan_type     String?           @db.VarChar(255)
  status        companies_status? @default(Active)
  logo_url      String?           @db.VarChar(255)
  created_at    DateTime          @default(now()) @db.Timestamp(0)
  adjustments   adjustments[]
  plans         plans             @relation(fields: [plan_id], references: [id], onUpdate: Restrict, map: "companies_ibfk_1")
  company_users company_users[]
  categories  categories[]
  subgroups   subgroups[]
  accounts accounts[]
  transactions  transactions[]
  tax_entries tax_entries[]
  users       users[]

  @@index([plan_id], map: "plan_id")
}

model company_users {
  id            Int                   @id @default(autoincrement())
  company_id    Int
  name          String?               @db.VarChar(100)
  email         String?               @unique(map: "email") @db.VarChar(120)
  password_hash String?               @db.VarChar(255)
  role          String?               @db.VarChar(255)
  status        company_users_status? @default(Active)
  created_at    DateTime              @default(now()) @db.Timestamp(0)
  companies     companies             @relation(fields: [company_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "company_users_ibfk_1")

  @@index([company_id], map: "company_id")
}

model ewaybills {
  id            Int               @id @default(autoincrement())
  company_id    Int
  bill_no       String            @unique(map: "bill_no") @db.VarChar(50)
  bill_date     DateTime          @db.Date
  from_location String            @db.VarChar(255)
  to_location   String            @db.VarChar(255)
  value         Decimal           @db.Decimal(12, 2)
  valid_until   DateTime          @db.Date
  status        ewaybills_status? @default(Active)
  created_at    DateTime          @default(now()) @db.Timestamp(0)
  updated_at    DateTime          @default(now()) @db.Timestamp(0)
}

model expensevoucher_items {
  id              Int             @id @default(autoincrement())
  voucher_id      Int
  account_name    String?         @db.VarChar(255)
  vendor_id       Int?
  amount          Decimal?        @default(0.00) @db.Decimal(12, 2)
  narration       String?         @db.VarChar(255)
  expensevouchers expensevouchers @relation(fields: [voucher_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "fk_expensevoucher_items")

  @@index([voucher_id], map: "fk_expensevoucher_items")
}

model expensevouchers {
  id                   Int                    @id @default(autoincrement())
  company_id           Int
  auto_receipt_no      String                 @db.VarChar(50)
  manual_receipt_no    String?                @db.VarChar(50)
  voucher_date         DateTime               @db.Date
  paid_from_account_id Int
  narration            String?                @db.Text
  total_amount         Decimal?               @default(0.00) @db.Decimal(12, 2)
  created_at           DateTime               @default(now()) @db.Timestamp(0)
  updated_at           DateTime               @default(now()) @db.Timestamp(0)
  expensevoucher_items expensevoucher_items[]
}

model income_voucher_entries {
  id              Int             @id @default(autoincrement())
  voucher_id      Int
  income_account  String          @db.VarChar(100)
  amount          Decimal         @db.Decimal(12, 2)
  row_narration   String?         @db.Text
  income_vouchers income_vouchers @relation(fields: [voucher_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "income_voucher_entries_ibfk_1")

  @@index([voucher_id], map: "voucher_id")
}

model item_category {
  id                 Int      @id @default(autoincrement())
  company_id         Int?
  item_category_name String?  @db.VarChar(255)
  created_at         DateTime @default(now()) @db.Timestamp(0)
}


model plan_requests {
  id            Int                          @id @default(autoincrement())
  company_id    Int
  plan_id       Int
  billing_cycle plan_requests_billing_cycle? @default(Monthly)
  request_date  DateTime?                    @default(dbgenerated("(curdate())")) @db.Date
  status        plan_requests_status?        @default(Pending)

}


model platform_users {
  id            Int                    @id @default(autoincrement())
  name          String                 @db.VarChar(100)
  email         String                 @unique(map: "email") @db.VarChar(120)
  password_hash String                 @db.VarChar(255)
  role          platform_users_role?   @default(ADMIN)
  status        platform_users_status? @default(ACTIVE)
  created_at    DateTime               @default(now()) @db.Timestamp(0)
}

model role_module_permissions {
  id          Int      @id @default(autoincrement())
  role_id     Int?
  module_name String?  @db.VarChar(255)
  can_create  String?  @db.VarChar(255)
  can_view    String?  @db.VarChar(255)
  can_update  String?  @db.VarChar(255)
  can_delete  String?  @db.VarChar(255)
  full_access String?  @db.VarChar(255)
  created_at  DateTime @default(now()) @db.Timestamp(0)
}

model role_types {
  id         Int      @id @default(autoincrement())
  type_name  String?  @db.VarChar(100)
  created_at DateTime @default(now()) @db.Timestamp(0)
}

model sales_orders {
  id                Int                 @id @default(autoincrement())
  company_id        Int
  quotation_id      Int?
  customer_id       Int
  ref_no            String?             @db.VarChar(100)
  manual_ref_no     String?             @db.VarChar(100)
  so_no             String?             @db.VarChar(100)
  manual_quo_no     String?             @db.VarChar(100)
  quotation_no      String?             @db.VarChar(100)
  order_date        DateTime            @db.Date
  notes             String?             @db.Text
  terms_conditions  String?             @db.Text
  status            String?             @default("draft") @db.VarChar(50)
  sub_total         Decimal?            @default(0.00) @db.Decimal(12, 2)
  tax_total         Decimal?            @default(0.00) @db.Decimal(12, 2)
  discount_total    Decimal?            @default(0.00) @db.Decimal(12, 2)
  grand_total       Decimal?            @default(0.00) @db.Decimal(12, 2)
  created_at        DateTime            @default(now()) @db.Timestamp(0)
  updated_at        DateTime            @default(now()) @db.Timestamp(0)
  sales_order_items sales_order_items[]
}

model salesorder {
  id                                Int                        @id @default(autoincrement())
  company_id                        Int
  company_name                      String?                    @db.VarChar(255)
  company_address                   String?                    @db.Text
  company_email                     String?                    @db.VarChar(255)
  company_phone                     String?                    @db.VarChar(50)
  logo_url                          String?                    @db.Text
  qoutation_to_customer_name        String?                    @db.VarChar(255)
  qoutation_to_customer_address     String?                    @db.Text
  qoutation_to_customer_email       String?                    @db.VarChar(255)
  qoutation_to_customer_phone       String?                    @db.VarChar(50)
  ref_no                            String?                    @db.VarChar(100)
  Manual_ref_ro                     String?                    @db.VarChar(100)
  Payment_no                        String?                    @db.VarChar(100)
  Manual_payment_no                 String?                    @db.VarChar(100)
  invoice_no                        String?                    @db.VarChar(100)
  Manual_invoice_no                 String?                    @db.VarChar(100)
  Manual_SO_ref                     String?                    @db.VarChar(100)
  Challan_no                        String?                    @db.VarChar(100)
  Manual_challan_no                 String?                    @db.VarChar(100)
  Manual_DC_no                      String?                    @db.VarChar(100)
  SO_no                             String?                    @db.VarChar(100)
  customer_ref                      String?                    @db.VarChar(100)
  quotation_no                      String?                    @db.VarChar(100)
  manual_quo_no                     String?                    @db.VarChar(100)
  quotation_date                    DateTime?                  @db.Date
  valid_till                        DateTime?                  @db.Date
  due_date                          DateTime?                  @db.Date
  subtotal                          Decimal?                   @default(0.00) @db.Decimal(15, 2)
  tax                               Decimal?                   @default(0.00) @db.Decimal(15, 2)
  discount                          Decimal?                   @default(0.00) @db.Decimal(15, 2)
  total                             Decimal?                   @default(0.00) @db.Decimal(15, 2)
  bank_name                         String?                    @db.VarChar(255)
  account_no                        String?                    @db.VarChar(100)
  account_holder                    String?                    @db.VarChar(255)
  ifsc_code                         String?                    @db.VarChar(50)
  notes                             String?                    @db.Text
  terms                             String?                    @db.Text
  signature_url                     String?                    @db.Text
  photo_url                         String?                    @db.Text
  attachment_url                    String?                    @db.Text
  bill_to_attention_name            String?                    @db.VarChar(255)
  bill_to_company_name              String?                    @db.VarChar(255)
  bill_to_company_address           String?                    @db.Text
  bill_to_company_phone             String?                    @db.VarChar(50)
  bill_to_company_email             String?                    @db.VarChar(255)
  bill_to_customer_name             String?                    @db.VarChar(255)
  bill_to_customer_address          String?                    @db.Text
  bill_to_customer_email            String?                    @db.VarChar(255)
  bill_to_customer_phone            String?                    @db.VarChar(50)
  ship_to_attention_name            String?                    @db.VarChar(255)
  ship_to_company_name              String?                    @db.VarChar(255)
  ship_to_company_address           String?                    @db.Text
  ship_to_company_phone             String?                    @db.VarChar(50)
  ship_to_company_email             String?                    @db.VarChar(255)
  ship_to_customer_name             String?                    @db.VarChar(255)
  ship_to_customer_address          String?                    @db.Text
  ship_to_customer_email            String?                    @db.VarChar(255)
  ship_to_customer_phone            String?                    @db.VarChar(50)
  payment_received_customer_name    String?                    @db.VarChar(255)
  payment_received_customer_address String?                    @db.Text
  payment_received_customer_email   String?                    @db.VarChar(255)
  payment_received_customer_phone   String?                    @db.VarChar(50)
  driver_name                       String?                    @db.VarChar(255)
  driver_phone                      String?                    @db.VarChar(50)
  amount_received                   Decimal?                   @default(0.00) @db.Decimal(15, 2)
  total_amount                      Decimal?                   @default(0.00) @db.Decimal(15, 2)
  payment_status                    salesorder_payment_status? @default(Pending)
  total_invoice                     Decimal?                   @default(0.00) @db.Decimal(15, 2)
  balance                           Decimal?                   @default(0.00) @db.Decimal(15, 2)
  payment_note                      String?                    @db.Text
  quotation_status                  String?                    @default("Pending") @db.VarChar(50)
  sales_order_status                String?                    @default("Pending") @db.VarChar(50)
  delivery_challan_status           String?                    @default("Pending") @db.VarChar(50)
  invoice_status                    String?                    @default("Pending") @db.VarChar(50)
  draft_status                      salesorder_draft_status?   @default(Draft)
  created_at                        DateTime                   @default(now()) @db.Timestamp(0)
  updated_at                        DateTime                   @default(now()) @db.Timestamp(0)
  salesorderitems                   salesorderitems[]
}

model salesorderitems {
  id             Int        @id @default(autoincrement())
  sales_order_id Int
  item_name      String     @db.VarChar(255)
  qty            Decimal?   @default(0.00) @db.Decimal(10, 2)
  rate           Decimal?   @default(0.00) @db.Decimal(15, 2)
  tax_percent    Decimal?   @default(0.00) @db.Decimal(5, 2)
  discount       Decimal?   @default(0.00) @db.Decimal(15, 2)
  amount         Decimal?   @default(0.00) @db.Decimal(15, 2)
  created_at     DateTime   @default(now()) @db.Timestamp(0)
  updated_at     DateTime   @default(now()) @db.Timestamp(0)
  salesorder     salesorder @relation(fields: [sales_order_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "fk_salesOrderItems")

  @@index([sales_order_id], map: "fk_salesOrderItems")
}

model salesorderquotation {
  quotation_id             Int                         @id @default(autoincrement()) @db.UnsignedInt
  company_id               Int
  customer_name            String                      @db.VarChar(255)
  customer_address         String?                     @db.Text
  customer_email           String?                     @db.VarChar(255)
  customer_phone           String?                     @db.VarChar(50)
  ref_no                   String?                     @db.VarChar(100)
  customer_ref             String?                     @db.VarChar(100)
  quotation_no             String?                     @db.VarChar(100)
  manual_quo_no            String?                     @db.VarChar(100)
  quotation_date           DateTime?                   @db.Date
  valid_till               DateTime?                   @db.Date
  subtotal                 Decimal?                    @default(0.00) @db.Decimal(15, 2)
  tax                      Decimal?                    @default(0.00) @db.Decimal(15, 2)
  discount                 Decimal?                    @default(0.00) @db.Decimal(15, 2)
  total                    Decimal?                    @default(0.00) @db.Decimal(15, 2)
  bank_name                String?                     @db.VarChar(255)
  account_no               String?                     @db.VarChar(50)
  account_holder           String?                     @db.VarChar(255)
  ifsc_code                String?                     @db.VarChar(20)
  notes                    String?                     @db.Text
  terms                    String?                     @db.Text
  signature_url            String?                     @db.VarChar(500)
  photo_url                String?                     @db.VarChar(500)
  attachment_url           String?                     @db.VarChar(500)
  logo_url                 String?                     @db.VarChar(500)
  status                   salesorderquotation_status? @default(Draft)
  created_at               DateTime                    @default(now()) @db.Timestamp(0)
  updated_at               DateTime                    @default(now()) @db.Timestamp(0)
  salesorderquotationitems salesorderquotationitems[]
}

model salesorderquotationitems {
  item_id             Int                 @id @default(autoincrement()) @db.UnsignedInt
  quotation_id        Int                 @db.UnsignedInt
  item_name           String              @db.VarChar(255)
  qty                 Decimal?            @default(0.00) @db.Decimal(10, 2)
  rate                Decimal?            @default(0.00) @db.Decimal(15, 2)
  tax_percent         Decimal?            @default(0.00) @db.Decimal(5, 2)
  discount            Decimal?            @default(0.00) @db.Decimal(15, 2)
  amount              Decimal?            @default(0.00) @db.Decimal(15, 2)
  created_at          DateTime            @default(now()) @db.Timestamp(0)
  updated_at          DateTime            @default(now()) @db.Timestamp(0)
  salesorderquotation salesorderquotation @relation(fields: [quotation_id], references: [quotation_id], onDelete: Cascade, onUpdate: Restrict, map: "fk_quotation_items")

  @@index([quotation_id], map: "fk_quotation_items")
}

model salesorders {
  id                      Int       @id @default(autoincrement())
  company_id              Int?
  company_name            String?   @db.VarChar(255)
  company_address         String?   @db.Text
  company_email           String?   @db.VarChar(255)
  company_phone           String?   @db.VarChar(50)
  customer_address        String?   @db.Text
  customer_email          String?   @db.VarChar(255)
  customer_phone          String?   @db.VarChar(50)
  quotation_no            String?   @db.VarChar(100)
  manual_qua_no           String?   @db.VarChar(100)
  quotation_date          DateTime? @db.Date
  valid_till              DateTime? @db.Date
  items                   String?   @db.LongText
  sub_total               Decimal?  @default(0.00) @db.Decimal(15, 2)
  tax                     Decimal?  @default(0.00) @db.Decimal(15, 2)
  discount                Decimal?  @default(0.00) @db.Decimal(15, 2)
  total                   Decimal?  @default(0.00) @db.Decimal(15, 2)
  bank_details            String?   @db.LongText
  notes                   String?   @db.Text
  terms_and_condition     String?   @db.Text
  signature_url           String?   @db.VarChar(1000)
  photo_url               String?   @db.VarChar(1000)
  attach_file_url         String?   @db.VarChar(1000)
  logo_url                String?   @db.VarChar(1000)
  quotation_status        Boolean?  @default(false)
  so_no                   String?   @db.VarChar(100)
  manual_so               String?   @db.VarChar(100)
  bill_to_attention_name  String?   @db.VarChar(255)
  bill_to_comp_name       String?   @db.VarChar(255)
  bill_to_comp_address    String?   @db.Text
  bill_to_comp_phone      String?   @db.VarChar(50)
  bill_to_comp_email      String?   @db.VarChar(255)
  ship_to_attention_name  String?   @db.VarChar(255)
  ship_to_comp_name       String?   @db.VarChar(255)
  ship_to_comp_address    String?   @db.Text
  ship_to_comp_phone      String?   @db.VarChar(50)
  ship_to_comp_email      String?   @db.VarChar(255)
  sales_status            Boolean?  @default(false)
  challan_no              String?   @db.VarChar(100)
  manual_dc_no            String?   @db.VarChar(100)
  driver_details          String?   @db.LongText
  delivery_challan_status Boolean?  @default(false)
  invoice_no              String?   @db.VarChar(100)
  manual_invoice_no       String?   @db.VarChar(100)
  bill_to_cust_name       String?   @db.VarChar(255)
  bill_to_cust_addr       String?   @db.Text
  bill_to_cust_email      String?   @db.VarChar(255)
  bill_to_cust_phone      String?   @db.VarChar(50)
  ship_to_cust_name       String?   @db.VarChar(255)
  ship_to_cust_addr       String?   @db.Text
  ship_to_cust_email      String?   @db.VarChar(255)
  ship_to_cust_phone      String?   @db.VarChar(50)
  invoice_status          Boolean?  @default(false)
  payment_no              String?   @db.VarChar(100)
  manual_pym_no           String?   @db.VarChar(100)
  received_cust_name      String?   @db.VarChar(255)
  received_addr           String?   @db.Text
  received_email          String?   @db.VarChar(255)
  received_phone          String?   @db.VarChar(50)
  amount_received         Decimal?  @default(0.00) @db.Decimal(15, 2)
  total_amount            Decimal?  @default(0.00) @db.Decimal(15, 2)
  payment_status          String?   @default("pending") @db.VarChar(50)
  total_invoice           Decimal?  @default(0.00) @db.Decimal(15, 2)
  total_amount_received   Decimal?  @default(0.00) @db.Decimal(15, 2)
  balance                 Decimal?  @default(0.00) @db.Decimal(15, 2)
  payment_notes           String?   @db.Text
  payment_step_status     Boolean?  @default(false)
  created_at              DateTime  @default(now()) @db.Timestamp(0)
  updated_at              DateTime  @default(now()) @db.Timestamp(0)
}

model salesquotation {
  id                   Int                    @id @default(autoincrement())
  company_id           Int
  customer_id          Int
  ref_no               String?                @db.VarChar(100)
  manual_ref_no        String?                @db.VarChar(100)
  quotation_no         String                 @db.VarChar(100)
  manual_quo_no        String?                @db.VarChar(100)
  quotation_date       DateTime               @db.Date
  valid_till           DateTime?              @db.Date
  sub_total            Decimal?               @default(0.00) @db.Decimal(15, 2)
  tax_total            Decimal?               @default(0.00) @db.Decimal(15, 2)
  discount_total       Decimal?               @default(0.00) @db.Decimal(15, 2)
  grand_total          Decimal?               @default(0.00) @db.Decimal(15, 2)
  notes                String?                @db.Text
  terms_conditions     String?                @db.Text
  status               salesquotation_status? @default(draft)
  created_at           DateTime               @default(now()) @db.Timestamp(0)
  updated_at           DateTime               @default(now()) @db.Timestamp(0)
  signature            String?                @db.VarChar(255)
  photo                String?                @db.VarChar(255)
  attachments          String?                @db.LongText
  salesquotation_items salesquotation_items[]
}

model salesquotation_items {
  id             Int            @id @default(autoincrement())
  quotation_id   Int
  product_id     Int
  item_name      String         @db.VarChar(255)
  qty            Decimal        @db.Decimal(10, 2)
  rate           Decimal        @db.Decimal(15, 2)
  tax            Decimal?       @default(0.00) @db.Decimal(5, 2)
  discount       Decimal?       @default(0.00) @db.Decimal(15, 2)
  amount         Decimal        @db.Decimal(15, 2)
  salesquotation salesquotation @relation(fields: [quotation_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "salesquotation_items_ibfk_1")

  @@index([quotation_id], map: "quotation_id")
}

model tax_entries {
  id         Int       @id @default(autoincrement())
  company_id Int
  type       String    @db.VarChar(50)
  party      String    @db.VarChar(150)
  pan        String    @db.VarChar(20)
  amount     Decimal   @db.Decimal(12, 2)
  rate       Decimal   @db.Decimal(5, 2)
  tax_amount Decimal   @db.Decimal(12, 2)
  entry_date DateTime  @db.Date
  created_at DateTime  @default(now()) @db.Timestamp(0)
  updated_at DateTime  @default(now()) @db.Timestamp(0)
  companies  companies @relation(fields: [company_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "tax_entries_ibfk_1")

  @@index([company_id], map: "company_id")
}

model transfer_items {
  id                  Int        @id @default(autoincrement())
  transfer_id         Int
  product_id          Int
  source_warehouse_id Int
  qty                 Decimal    @db.Decimal(10, 2)
  rate                Decimal?   @default(0.00) @db.Decimal(15, 2)
  narration           String?    @db.VarChar(255)
  created_at          DateTime   @default(now()) @db.Timestamp(0)
  transfers           transfers  @relation(fields: [transfer_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "transfer_items_ibfk_1")
  products            products   @relation(fields: [product_id], references: [id], onUpdate: Restrict, map: "transfer_items_ibfk_2")
  warehouses          warehouses @relation(fields: [source_warehouse_id], references: [id], onUpdate: Restrict, map: "transfer_items_ibfk_3")

  @@index([product_id], map: "product_id")
  @@index([source_warehouse_id], map: "source_warehouse_id")
  @@index([transfer_id], map: "transfer_id")
}

model transfers {
  id                       Int              @id @default(autoincrement())
  company_id               Int
  voucher_no               String           @db.VarChar(50)
  manual_voucher_no        String?          @db.VarChar(50)
  transfer_date            DateTime         @db.Date
  destination_warehouse_id Int
  notes                    String?          @db.Text
  created_at               DateTime         @default(now()) @db.Timestamp(0)
  transfer_items           transfer_items[]
}

model unit_details {
  id              Int      @id @default(autoincrement())
  company_id      Int?
  uom_id          Int?
  weight_per_unit Float?   // ✅ No @db.VarChar — let Prisma choose REAL/DOUBLE
  created_at      DateTime @default(now()) @db.Timestamp(0)
}

model uoms {
  id         Int      @id @default(autoincrement())
  company_id Int?
  unit_name  String?  @db.VarChar(100)
  created_at DateTime @default(now()) @db.Timestamp(0)
}

model voucher_attachments {
  id              Int      @id @default(autoincrement())
  voucher_id      Int
  file_name       String   @db.VarChar(255)
  file_type       String   @db.VarChar(100)
  file_url        String   @db.VarChar(255)
  attachment_type String   @db.VarChar(50)
  vouchers        vouchers @relation(fields: [voucher_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "voucher_attachments_ibfk_1")

  @@index([voucher_id], map: "voucher_id")
}

model voucher_payments {
  id                Int       @id @default(autoincrement())
  voucher_id        Int
  payment_mode      String    @db.VarChar(50)
  payment_amount    Decimal   @db.Decimal(10, 2)
  payment_reference String?   @db.VarChar(100)
  payment_date      DateTime? @db.Date
  vouchers          vouchers  @relation(fields: [voucher_id], references: [id], onDelete: Cascade, onUpdate: Restrict, map: "voucher_payments_ibfk_1")

  @@index([voucher_id], map: "voucher_id")
}

enum PlanStatus {
  Active
  Inactive
}

enum plan_requests_billing_cycle {
  Monthly
  Yearly
}

enum adjustments_adjustment_type {
  add
  remove
  adjust
}

enum platform_users_role {
  SUPER_ADMIN
  ADMIN
  STAFF
}

enum plan_requests_status {
  Pending
  Approved
  Rejected
}

enum platform_users_status {
  ACTIVE
  INACTIVE
}

enum company_users_status {
  Active
  Inactive
}

enum companies_status {
  Active
  Inactive
}

enum ewaybills_status {
  Active
  Inactive
  Expired
}

enum plans_billing_cycle {
  Monthly
  Quarterly
  Yearly
}

enum salesquotation_status {
  draft
  sent
  accepted
  rejected
}

enum salesorderquotation_status {
  Draft
  Final
}

enum salesorder_payment_status {
  Pending
  Partial
  Paid
}

enum salesorder_draft_status {
  Draft
  Final
}

model company_settings {
  id                BigInt        @id @default(autoincrement())
  company_name      String?       @db.VarChar(255)
  email             String?       @db.VarChar(255)
  phone_number      String?       @db.VarChar(50)
  address           String?       @db.Text
  country           CountryCode? // ← Enum
  city              CityName? // ← Enum
  state             StateName? // ← Enum
  postal_code       String?       @db.VarChar(20) // Keep as string — varies too much
  currency          CurrencyCode? // ← Enum
  gstin             String?       @db.VarChar(20)
  company_icon      String?       @db.VarChar(500)
  favicon           String?       @db.VarChar(500)
  company_logo      String?       @db.VarChar(500)
  company_dark_logo String?       @db.VarChar(500)
  created_at        DateTime      @default(now()) @db.Timestamp(0)

  @@index([company_name], map: "company_settings_company_name_idx")
  @@index([email], map: "company_settings_email_idx")
  @@index([gstin], map: "company_settings_gstin_idx")
  @@index([country], map: "company_settings_country_idx")
  @@index([city], map: "company_settings_city_idx")
  @@index([state], map: "company_settings_state_idx")
  @@index([currency], map: "company_settings_currency_idx")
}

enum CountryCode {
  USA
  India
  UAE
  France
  Australia
}

enum CityName {
  NewYork
  Mumbai
  Dubai
  Paris
}

enum StateName {
  Alaska
  California
  TamilNadu
  Dubai
}

enum CurrencyCode {
  USD
  EUR
  GBP
  AED
  INR
  SAR
  JPY
}




#npx prisma migrate dev --name init