import { useEffect, useRef } from "react";

/**
 * Hook para monitorar inatividade do usuário e executar uma ação após um tempo determinado
 * @param timeoutMinutes - Tempo em minutos antes de considerar inatividade
 * @param onTimeout - Função a ser executada quando o timeout for atingido
 */
export function useInactivityTimeout(
  timeoutMinutes: number,
  onTimeout: () => void
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Atualizar a referência da função sempre que ela mudar
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimeout = () => {
    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Definir novo timeout
    timeoutRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutMinutes * 60 * 1000); // Converter minutos para milissegundos
  };

  useEffect(() => {
    // Eventos que indicam atividade do usuário
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Adicionar listeners para os eventos
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout, true);
    });

    // Iniciar o timeout
    resetTimeout();

    // Cleanup: remover listeners e limpar timeout
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout, true);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [timeoutMinutes]);
}

