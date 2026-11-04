# Product Requirements Document (PRD)
## Project Name: ReWear — Clothing Exchange & Swap Marketplace
**Internship Organization:** Unified Mentor  
**Project Track:** Full-Stack Web Development Capstone  
**Version:** 1.0.0 (Production-Minded Submission)  
**Author:** Senior Full-Stack Developer & Unified Mentor Intern  

---

### 1. Executive Summary & Problem Statement

#### 1.1 The Problem
The global fashion industry contributes over 10% of annual carbon emissions and consumes billions of cubic meters of fresh water. In India, millions of wearable, high-quality textile pieces—ranging from formal ethnic silks and tailored denim to contemporary streetwear—are retired after few wears, eventually entering municipal waste streams or lingering unused in closets.

Meanwhile, monetary resale platforms incur high commission fees (15%–30%), payment gateway charges, and fraud risks that discourage everyday circularity.

#### 1.2 The Solution
**ReWear** is a dedicated peer-to-peer sustainable clothing exchange marketplace operating on **100% cashless, zero-monetary principles**. Instead of buying or selling, users trade garments directly based on fair estimated swap credits calibrated through a documented rule-based algorithm. ReWear merges high-fashion editorial aesthetics with robust administrative governance, dispute moderation, and environmental impact tracking.

---

### 2. User Personas & Target Audiences

| Persona | Motivation | Key Capabilities on ReWear |
|---|---|---|
| **Conscious Consumer / Student** | Wants to refresh wardrobe affordably without buying fast-fashion. | Browse local listings, test swap values, propose exchanges. |
| **Vintage & Streetwear Collector** | Holds unique pieces (selvedge denim, sneakers, jackets) and wants peer trades. | Filter by size/brand, negotiate fabric fit in chat, arrange tracked courier delivery. |
| **Artisan & Ethnic Wear Swapper** | Possesses festive kurtas/sarees worn only once or twice. | Trade high-value traditional attire with verified parity match. |
| **Platform Administrator** | Monitors platform integrity, resolves disputes, prevents counterfeits. | Access dedicated `/admin/login`, review live MongoDB aggregations, suspend malicious users. |

---

### 3. Architecture & Tech Stack

```
                              ┌────────────────────────────────────────┐
                              │           CLIENT (Vite + React)        │
                              │  - Tailwind CSS luxury theme           │
                              │  - Playfair Display & Plus Jakarta     │
                              │  - React Router v7 & Lucide Icons      │
                              │  - AuthContext + Socket.io Client      │
                              └───────────────────┬────────────────────┘
                                                  │ HTTP / WebSockets
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │          SERVER (Express + Node)       │
                              │  - RESTful API Architecture            │
                              │  - JWT Auth + HttpOnly Cookies         │
                              │  - Multer Image Engine (/uploads/)     │
                              │  - ValueCalculatorService              │
                              │  - Socket.IO Messaging Hub             │
                              └───────────────────┬────────────────────┘
                                                  │ Mongoose ODM
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │            DATABASE (MongoDB)          │
                              │  - User, ClothingListing, SwapRequest  │
                              │  - Conversation, Message, Report       │
                              │  - Text search indexes & Aggregations  │
                              └────────────────────────────────────────┘
```

---

### 4. Core System Workflows

#### 4.1 Strict Role Separation & Authentication
- **Customer Auth (`/login`, `/register`)**:
  - Enforces `role: 'customer'`.
  - Frontend role parameters in registration are strictly ignored to prevent privilege escalation.
  - Password hashing with `bcryptjs` (salt rounds = 10).
- **Dedicated Administrator Auth (`/admin/login`)**:
  - Dedicated route with high-security command center aesthetic.
  - Backend verifies `user.role === 'admin'`. Regular customer credentials return `403 Forbidden`.
  - Admin protected routes (`/admin/*`) guarded by `AdminRoute` on frontend and `verifyAdmin` middleware on backend.

#### 4.2 Garment Listing & Smart Valuation
- **Fields**: Title, description, category (`women`, `men`, `ethnic_wear`, `shoes`, `accessories`, `kids`), gender, brand, size, condition, color, material, reference retail price, estimated swap value, city, postal code, handover preference (`in_person`, `courier`, `both`), photos.
- **Valuation Formula**:
  $$\text{Estimated Swap Value} = \text{Reference Price} \times \text{Condition Multiplier} \times \text{Brand Tier Multiplier}$$
  - *Condition Multipliers*: New with tags ($0.90$), Like new ($0.75$), Good ($0.55$), Fair ($0.30$).
  - *Brand Tiers*: Luxury ($1.15$), Premium ($1.00$), Standard ($0.90$), Value ($0.80$).

#### 4.3 Swap Request Lifecycle & Concurrency Locking
1. **Proposal**: Requester selects their own available item to offer against recipient's available item.
2. **Validation**: Prevents requesting own item; checks availability of both items; computes parity tolerance ($\le 15\%$ equitable match, $16\%-30\%$ fair match, $>30\%$ variance).
3. **Acceptance & Locking**: Recipient accepts proposal $\rightarrow$ both items automatically transition to `status: 'in_swap'`. All conflicting pending proposals involving either item are automatically rejected.
4. **Coordination**: Parties use linked `/chat` thread to agree on local meetup spot or courier tracking AWB.
5. **Completion**: Either or both parties confirm receipt $\rightarrow$ items updated to `status: 'swapped'`. Environmental savings counter increments.

---

### 5. Environmental Savings Impact Model

Every completed exchange recirculates two garments, saving:
- **Clean Water**: $2 \times 2,700\text{ Litres} = 5,400\text{ Litres}$
- **Carbon Dioxide**: $2 \times 3.6\text{ kg} = 7.2\text{ kg CO}_2$
- **Solid Waste**: $2$ textile pieces diverted from landfill.

---

### 6. Limitations & Future Roadmap
- **Current Fallbacks**: Image uploads default to local static `/uploads/` directory with Cloudinary config compatibility. Manual shipping AWB tracking provided in lieu of direct commercial carrier API keys.
- **Future Enhancements (Post-Internship)**:
  - Integration with Shiprocket or Delhivery APIs for automated pickup.
  - QR-code scan verification for in-person handovers.
  - Verified community swap events / pop-up hubs.

