# Research: Food Demand Prediction in Campus Hostel Dining

## 1. Problem Description

In university residential hostels, evening snack sessions (typically 5:00 PM to 7:00 PM) represent a high-volatility culinary operation. Unlike fixed-menu dinners where students have mandatory mess subscriptions, evening snacks (such as samosas, bread pakoras, aloo bondas, and tea) are prepared on demand and subject to drastic day-to-day fluctuations in student turnout. 

Over a 24-day observational fieldwork study at Block 3 Kaveri Boys Hostel Mess, two major operational failures were consistently observed:
1. **Severe Food Wastage (Over-preparation):** On days with low turnout (particularly Sundays or post-exam evenings), preparing the customary baseline of 90–95 snack portions led to 14–18 unsold portions (up to 20% waste). Because deep-fried snacks lose crispness and cannot be hygienically preserved overnight in ambient kitchen conditions, surplus food is routinely discarded.
2. **Food Shortages / Stockouts (Under-preparation):** On peak days (such as Friday evenings when lab sessions conclude, or cold overcast/drizzly days), turnout surged beyond 105 students. Samosas ran out as early as 6:25 PM, leaving 15–25 students disappointed and generating kitchen conflict.
3. **Manual Guesswork Dependency:** The cook, Rameshwar Prasad ("Ramesh Bhaiya"), lacked any data tool and relied solely on intuition. He prepared arbitrary batch sizes based on habit rather than actionable signals.

The challenge was to design a lightweight, real-time demand estimation tool that leverages an accessible proxy metric—**the student entrance headcount between 5:00 PM and 6:00 PM**—to recommend the exact batch quantity to fry before the 6:00 PM peak rush begins.

---

## 2. Examination of Two Existing Commercial Solutions

### Solution 1: Automated Waste-Logging Vision Scales (e.g., Winnow Solutions & Leanpath 360)
- **Overview:** Winnow and Leanpath deploy smart industrial scales with integrated computer vision cameras positioned above kitchen waste bins. When kitchen staff discard leftover food, the system captures an image, weighs the waste, and logs financial loss metrics.
- **Why It Does Not Fit the Selected Cook:**
  - *Post-Hoc Rather Than Predictive:* Winnow measures food *after* it has already become waste. It does not provide forward-looking batch quantity advice at 5:45 PM before cooking begins.
  - *Prohibitive Cost and Fragile Hardware:* Commercial subscription costs exceed $2,500–$5,000 annually per terminal. The hardware cannot withstand the intense heat, grease vapor, and flour dust adjacent to open Indian kadai fryers.
  - *Operational Burden:* Requiring a high-volume mess cook to stop and log waste categories on a touch panel during the evening rush disrupts kitchen flow.

### Solution 2: Campus Dining ERP & Mobile Pre-Ordering Systems (e.g., CBORD Foodservice Suite & Toast POS)
- **Overview:** Enterprise campus management platforms utilize student ID swipe cards, cashless meal plans, and pre-order mobile applications to estimate dining hall counts.
- **Why It Does Not Fit the Selected Cook:**
  - *Unrealistic Student Behavioral Assumption:* Evening snacks in Indian hostel messes are spontaneous, cash-or-UPI counter purchases rather than scheduled meal plan credits. Students do not pre-order a samosa three hours in advance.
  - *Excessive Complexity & Digital Literacy Barrier:* Enterprise software requires multi-tiered user accounts, stockroom SKU mapping, and complex administrative setup. Ramesh Bhaiya requires an interface with four large fields, big numbers, and an immediate actionable answer in under 15 seconds.

---

## 3. Academic Sources Consulted

1. **Papargyropoulou, E., Lozano, R., Steinberger, J. K., Wright, N., & Ujang, Z. (2014).**  
   *The food waste hierarchy in food service and university catering.*  
   **Journal:** *Resources, Conservation and Recycling*, Vol. 93, pp. 180–190.  
   **Key Takeaway Applied:** The authors establish that "prevention at source via demand forecasting" is significantly more effective at reducing catering waste than redistribution or disposal hierarchies. In university settings, student eating habits are non-linear and exhibit severe day-of-week clustering.

2. **Betz, A., Buchli, J., Göbel, C., & Müller, C. (2015).**  
   *Food waste in the Swiss food service industry – Amount and potential for reduction.*  
   **Journal:** *Waste Management*, Vol. 43, pp. 218–226.  
   **Key Takeaway Applied:** The study revealed that over-preparation accounts for 45–60% of avoidable kitchen food waste, driven by cook risk-aversion (the fear of running out during service). Providing cooks with an explicit, explainable "safety buffer" reduces over-preparation without triggering stockout anxiety.
