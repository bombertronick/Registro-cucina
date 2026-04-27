import streamlit as st
import pandas as pd

# 1. Impostazioni Pagina
st.set_page_config(page_title="Registro Cucina", layout="centered")

# 2. Nascondi menu strumenti Streamlit
st.markdown("""
    <style>
    [data-testid="stElementToolbar"] { display: none !important; }
    footer {visibility: hidden;}
    </style>
    """, unsafe_allow_html=True)

st.title("👨‍🍳 Registro Preparazioni")

# 3. Database Blindato (Funzione sicura)
def crea_dati_iniziali():
    return {
        "LUN / GIO": [
            {"Alimento": "Fiori di zucca", "Linea": "1/3", "Scorta": "1"},
            {"Alimento": "Patate al forno", "Linea": "1/3", "Scorta": "2"},
            {"Alimento": "Zucchine al forno", "Linea": "1/6", "Scorta": "2"},
            {"Alimento": "Melanzane al forno", "Linea": "1/6", "Scorta": "1"},
            {"Alimento": "Peperoni al forno", "Linea": "1/6", "Scorta": "1"},
            {"Alimento": "Funghi affettati", "Linea": "1/1", "Scorta": "3"},
            {"Alimento": "Salsiccia", "Linea": "1/3", "Scorta": "1"},
            {"Alimento": "Prosciutto cotto", "Linea": "1/6", "Scorta": "1"},
            {"Alimento": "Prosciutto crudo", "Linea": "1/3", "Scorta": "2"},
            {"Alimento": "Guanciale", "Linea": "1/6", "Scorta": "1"},
            {"Alimento": "Ventricina", "Linea": "1/6", "Scorta": "2"},
            {"Alimento": "Provola", "Linea": "1/6", "Scorta": "1"},
            {"Alimento": "Mozzarella jul", "Linea": "1/1", "Scorta": "40 KG"},
            {"Alimento": "Sugo", "Linea": "1/1", "Scorta": "3"}
        ],
        "VENERDÌ": [
            {"Alimento": "Fiori di zucca", "Linea": "1/3", "Scorta": "1"},
            {"Alimento": "Rughetta", "Linea": "1/3", "Scorta": "3 etti"},
            {"Alimento": "Mozz. no latt.", "Linea": "1/3", "Scorta": "1,5 kg"},
            {"Alimento": "Pecorino gratt.", "Linea": "1/6", "Scorta": "1 kg"},
            {"Alimento": "Mozzarella jul", "Linea": "1/1", "Scorta": "60 KG"}
        ],
        "SAB / DOM": [
            {"Alimento": "Fiori di zucca", "Linea": "1/3", "Scorta": "1"},
            {"Alimento": "Patate al forno", "Linea": "1/3", "Scorta": "3"},
            {"Alimento": "Funghi affettati", "Linea": "1/1", "Scorta": "4"},
            {"Alimento": "Prosciutto crudo", "Linea": "1/3", "Scorta": "3"},
            {"Alimento": "Mozzarella jul", "Linea": "1/1", "Scorta": "120 KG"},
            {"Alimento": "Sugo", "Linea": "1/1", "Scorta": "4"}
        ],
        "MAGAZZINO": [
            {"Alimento": "Carciofi/Olive", "Regola": "Appena aperto"},
            {"Alimento": "Olio EVO", "Regola": "Sotto 2lt"},
            {"Alimento": "Olio semi", "Regola": "Sotto 5lt"},
            {"Alimento": "Sale/Pepe/Orig.", "Regola": "Sotto 2kg"},
            {"Alimento": "Mozz. no latt.", "Regola": "Appena aperta"}
        ]
    }

# Inizializzazione sicura della sessione
if 'dati_cucina' not in st.session_state:
    db = crea_dati_iniziali()
    for categoria in db:
        for elemento in db[categoria]:
            elemento["✓"] = False
            elemento["Note"] = ""
    st.session_state['dati_cucina'] = db

# 4. Interfaccia
scelta = st.radio("Scegli la lista:", list(st.session_state['dati_cucina'].keys()), horizontal=True)

df = pd.DataFrame(st.session_state['dati_cucina'][scelta])
edited_df = st.data_editor(
    df,
    column_config={"✓": st.column_config.CheckboxColumn("✓", default=False)},
    disabled=["Alimento", "Linea", "Scorta", "Regola"],
    hide_index=True,
    use_container_width=True,
    key=f"editor_{scelta}"
)

# 5. Bottoni Salva e Reset
if st.button("✅ SALVA MODIFICHE"):
    st.session_state['dati_cucina'][scelta] = edited_df.to_dict('records')
    st.success("Tabella aggiornata correttamente!")

if st.button("🗑️ AZZERA TUTTO (Reset)"):
    st.session_state.clear()
    st.rerun()
