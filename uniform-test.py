import random
import requests
import matplotlib.pyplot as plt

url_endpoint = 'http://localhost:3000/asignatura/'

def random_id():
    numero_aleatorio = random.randint(1, 8712)
    return numero_aleatorio

def realizar_consulta_get(id_asignatura):
    try:
        respuesta = requests.get(f"{url_endpoint}{id_asignatura}")
        if respuesta.status_code == 200:
            datos = respuesta.json()
            print(f"Datos de la asignatura con ID {id_asignatura}:")
            for clave, valor in datos.items():
                print(f"  - {clave}: {valor}")
        else:
            print(f"Error al realizar la consulta para ID {id_asignatura}: {respuesta.status_code}")
    except Exception as error:
        print(f"Error inesperado al realizar la consulta para ID {id_asignatura}: {error}")

def main():
    cantidad_consultas = int(input("¿Cuántas consultas aleatorias desea realizar? "))
    registro_consultas = {}

    for _ in range(cantidad_consultas):
        id_asignatura_aleatorio = random_id()
        if id_asignatura_aleatorio in registro_consultas:
            registro_consultas[id_asignatura_aleatorio] += 1
        else:
            registro_consultas[id_asignatura_aleatorio] = 1
        realizar_consulta_get(id_asignatura_aleatorio)

    registro_consultas_ordenado = dict(sorted(registro_consultas.items()))

    print("\nEstadísticas de las consultas:")
    for id_asignatura, cantidad in registro_consultas_ordenado.items():
        print(f"  - ID {id_asignatura}: {cantidad} consultas")

    # Data for plotting
    ids = list(registro_consultas_ordenado.keys())
    counts = list(registro_consultas_ordenado.values())

    # Creating a bar plot
    plt.figure(figsize=(10, 5))
    plt.bar(ids, counts, color='blue')
    plt.xlabel('ID de la Asignatura')
    plt.ylabel('Cantidad de Consultas')
    plt.title('Cantidad de Consultas por ID de Asignatura')

    # Saving the plot
    filename = input("Ingrese el nombre del archivo para guardar el gráfico (incluya la extensión, ej. grafico.png): ")
    plt.savefig(filename)
    print(f"Gráfico guardado como {filename}")

if __name__ == "__main__":
    main()
