    import streamlit as st
import pandas as pd

# Impostazioni pagina
st.set_page_config(page_title="Registro Preparazioni", layout="centered")

# TRUCCO PER NASCONDERE LA BARRA STRANA (Occhietto, Download, ecc.)
st.markdown("""
    <style>
    [data-testid="stElementToolbar"] { display: none !important; }
    .main { background-color: #ffffff; }
    </style>
    """, unsafe_allow_html=True)

st.title("👨‍🍳 Registro Preparazioni")

if 'data' not in st.session_state:
    st.session_state.data = {
        "LUN / GIO": [
            {"Alimento": "Fiori di zucca", "Linea": "1 gn 1/3", "Scorta": "1"},
            {"Alimento": "Patate al forno", "Linea": "1 gn 1/3", "Scorta": "2"},
            {"Alimento": "Zucchine al forno", "Linea": "1 gn 1/6", "Scorta": "2"},
            {"Alimento": "Melanzane al forno", "Linea": "1 gn 1/6", "Scorta": "1"},
            {"Alimento": "Peperoni al forno", "Linea": "1 gn 1/6", "Scorta": "1"},
            {"Alimento": "Funghi affettati", "Linea": "1 gn 1/1", "Scorta": "3"},
            {"Alimento": "Salsiccia", "Linea": "gn 1/3", "Scorta": "1"},
            {"Alimento": "Prosciutto cotto", "Linea": "1 gn 1/6", "Scorta": "1"},
            {"Alimento": "Prosciutto crudo", "Linea": "1 gn 1/3", "Scorta": "2"},
            {"Alimento": "Guanciale", "Linea": "1 gn 1/6", "Scorta": "1"},
            {"Alimento": "Ventricina", "Linea": "1 gn 1/6", "Scorta": "2"},
            {"Alimento": "Provola", "Linea": "1 gn 1/6", "Scorta": "1"},
            {"Alimento": "Mozzarella julienne", "Linea": "gn 1/1", "Scorta": "40 KG"},
            {"Alimento": "Sugo", "Linea": "1 gn 1/1", "Scorta": "3"}
        ],
        "VENERDÌ": [
            {"Alimento": "Fiori di zucca", "Linea": "1 gn 1/3", "Scorta": "1"},
            {"Alimento": "Rughetta", "Linea": "1 gn 1/3", "Scorta": "3 etti"},
            {"Alimento": "Mozz. no lattosio", "Linea": "1 gn 1/3", "Scorta": "1,5 kg"},
            {"Alimento": "Pecorino gratt.", "Linea": "gn 1/6", "Scorta": "1 kg"},
            {"Alimento": "Mozzarella julienne", "Linea": "gn 1/1", "Scorta": "60 KG"}
        ],
        "SAB / DOM": [
            {"Alimento": "Fiori di zucca", "Linea": "1 gn 1/3", "Scorta": "1"},
            {"Alimento": "Patate al forno", "Linea": "1 gn 1/3", "Scorta": "3"},
            {"Alimento": "Zucchine al forno", "Linea": "1 gn 1/6", "Scorta": "2"},
            {"Alimento": "Melanzane al forno", "Linea": "1 gn 1/6", "Scorta": "2"},
            {"Alimento": "Peperoni al forno", "Linea": "1 gn 1/6", "Scorta": "1"},
            {"Alimento": "Funghi affettati", "Linea": "1 gn 1/1", "Scorta": "4"},
            {"Alimento": "Prosciutto crudo", "Linea": "1 gn 1/3", "Scorta": "3"},
            {"Alimento": "Rughetta", "Linea": "1 gn 1/3", "Scorta": "4 etti"},
            {"Alimento": "Mozzarella julienne", "Linea": "gn 1/1", "Scorta": "120 KG"},
            {"Alimento": "Sugo", "Linea": "1 gn 1/1", "Scorta": "4"}
        ],
        "MAGAZZINO": [
            {"Prodotto": "Carciofi/Olive/Alici", "Regola": "Appena aperto"},
            {"Prodotto": "Tonno/Uova sode", "Regola": "Appena aperto"},
            {"Prodotto": "Olio EVO", "Regola": "Sotto 2lt"},
            {"Prodotto": "Olio semi", "Regola": "Sotto 5lt"},
            {"Prodotto": "Sale/Pepe/Origano", "Regola": "Sotto 2kg"},
            {"Prodotto": "Cipolla a fette", "Regola": "Sotto 0.2kg"},
            {"Prodotto": "Mozz. no lattosio", "Regola": "Appena aperta"}
        ]
    }
    for k in st.session_state.data:
        for i in st.session_state.data[k]:
            i["✓"] = False
            i["Note"] = ""

scelta = st.radio("Seleziona:", list(st.session_state.data.keys()), horizontal=True)

df = pd.DataFrame(st.session_state.data[scelta])
edited_df = st.data_editor(
    df,
    column_config={"✓": st.column_config.CheckboxColumn("✓", default=False)},
    disabled=["Alimento", "Prodotto", "Linea", "Scorta", "Regola"],
    hide_index=True,
    use_container_width=True,
    key=f"editor_{scelta}"
)

if st.button("✅ SALVA AGGIORNAMENTO"):
    st.session_state.data[scelta] = edited_df.to_dict('records')
    st.success("Salvato!")

if st.button("🗑️ RESET"):
    st.session_state.clear()
    st.rerun()
