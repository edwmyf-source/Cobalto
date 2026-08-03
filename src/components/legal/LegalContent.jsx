// Documentos legales. Se escriben una sola vez aquí y se reutilizan tanto en
// la pantalla de bienvenida (visitante sin sesión) como en las rutas de la app
// (usuario con sesión), porque el enrutador no se monta hasta iniciar sesión.

export const LEGAL_EMAIL = 'info@redcobalto.com'
export const LEGAL_UPDATED = '2 de agosto de 2026'

export function LegalLayout({ title, updated, children, onBack }) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {onBack && (
        <button onClick={onBack}
          className="text-[13px] font-bold mb-6 hover:underline"
          style={{ color: 'var(--accent-deep)' }}>
          ← Volver
        </button>
      )}

      <h1 className="text-[32px] md:text-[40px] font-extrabold leading-tight"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
        {title}
      </h1>
      <p className="t-caption mt-3 mb-8" style={{ color: 'var(--text-tertiary)' }}>
        Última actualización: {updated}
      </p>

      <div className="flex flex-col gap-8">{children}</div>
    </div>
  )
}

export function Section({ n, title, children }) {
  return (
    <section>
      <h2 className="text-[18px] md:text-[20px] font-extrabold mb-3"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {n}. {title}
      </h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </section>
  )
}

export function Bullets({ items }) {
  return (
    <ul className="flex flex-col gap-2 pl-1">
      {items.map((t, i) => (
        <li key={i} className="flex gap-2.5">
          <span style={{ color: 'var(--accent)' }}>•</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   TÉRMINOS Y CONDICIONES
   ══════════════════════════════════════════════════════════════════════ */
export function TerminosContent() {
  return (
    <>
      <Section n="1" title="Qué es Red Cobalto">
        <p>
          Red Cobalto es una plataforma digital que conecta a profesionales, laboratorios,
          proveedores y empresas del sector químico en Colombia. Permite publicar
          información, productos, servicios y oportunidades laborales, y contactar a otros
          miembros a través de una mensajería interna.
        </p>
        <p>
          Al crear una cuenta o usar la plataforma, aceptas estos términos. Si no estás de
          acuerdo con ellos, no uses el servicio.
        </p>
      </Section>

      <Section n="2" title="Quién puede registrarse">
        <Bullets items={[
          'Debes ser mayor de 18 años.',
          'Debes registrarte con tu nombre real. No se permiten identidades falsas ni suplantar a otra persona o empresa.',
          'Eres responsable de la actividad que ocurra en tu cuenta y de mantener seguro tu acceso.',
          'Una persona no puede tener varias cuentas con el mismo número de celular.',
        ]} />
      </Section>

      <Section n="3" title="Qué puedes publicar">
        <p>
          Eres el único responsable del contenido que publiques. Al publicarlo, confirmas
          que tienes derecho a hacerlo y que no infringe derechos de terceros.
        </p>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No está permitido publicar:</p>
        <Bullets items={[
          'Contenido falso, engañoso o fraudulento.',
          'Ofertas de sustancias cuya comercialización esté restringida o prohibida por la ley colombiana, incluidas las sustancias sujetas a control especial.',
          'Contenido que infrinja derechos de autor, marcas o secretos empresariales.',
          'Discurso de odio, acoso, amenazas o contenido discriminatorio.',
          'Datos personales de terceros sin su autorización.',
          'Publicidad engañosa, spam o mensajes masivos no solicitados.',
        ]} />
      </Section>

      <Section n="4" title="Sobre las sustancias químicas">
        <p>
          Red Cobalto es un espacio de conexión entre las partes, no un vendedor ni un
          intermediario de las transacciones. No verificamos la calidad, legalidad,
          disponibilidad ni el cumplimiento normativo de los productos o servicios que
          publican los usuarios.
        </p>
        <p>
          Cada usuario es responsable de cumplir la normativa aplicable a su actividad,
          incluidos los permisos, licencias y controles que exijan las autoridades
          colombianas para el manejo de sustancias químicas. Cualquier negociación,
          contrato o transacción ocurre directamente entre las partes y bajo su propio
          riesgo.
        </p>
      </Section>

      <Section n="5" title="Moderación y suspensión">
        <p>
          Podemos eliminar contenido o suspender cuentas que incumplan estos términos, que
          hayan sido reportadas por otros usuarios o que representen un riesgo para la
          comunidad. Cuando sea razonable, informaremos el motivo.
        </p>
        <p>
          También puedes reportar publicaciones o bloquear usuarios desde la aplicación.
        </p>
      </Section>

      <Section n="6" title="Tu contenido y tu cuenta">
        <Bullets items={[
          'El contenido que publicas sigue siendo tuyo. Nos autorizas a mostrarlo dentro de la plataforma para que otros miembros puedan verlo.',
          'Puedes eliminar tus publicaciones en cualquier momento desde la aplicación.',
          'Al eliminar una publicación se borran también sus comentarios y reacciones; las conversaciones de chat que hayan surgido de ella se conservan.',
          'Puedes solicitar la eliminación de tu cuenta escribiendo a ' + LEGAL_EMAIL + '.',
        ]} />
      </Section>

      <Section n="7" title="Servicio y disponibilidad">
        <p>
          El servicio se ofrece "tal cual". Trabajamos para mantenerlo disponible y
          funcionando, pero no garantizamos que esté libre de interrupciones o errores.
          Podemos modificar o descontinuar funciones, avisando cuando el cambio sea
          relevante.
        </p>
        <p>
          Red Cobalto no se hace responsable por acuerdos, pagos, incumplimientos o
          perjuicios derivados de las relaciones comerciales que los usuarios establezcan
          entre sí.
        </p>
      </Section>

      <Section n="8" title="Cambios a estos términos">
        <p>
          Podemos actualizar estos términos. Si el cambio es sustancial, lo informaremos
          dentro de la plataforma. Continuar usando el servicio después de la actualización
          implica aceptar la nueva versión.
        </p>
      </Section>

      <Section n="9" title="Ley aplicable y contacto">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia. Cualquier
          controversia se resolverá ante los jueces competentes del territorio colombiano.
        </p>
        <p>
          Para cualquier duda sobre estos términos, escríbenos a{' '}
          <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>{LEGAL_EMAIL}</span>.
        </p>
      </Section>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS
   ══════════════════════════════════════════════════════════════════════ */
export function PrivacidadContent() {
  return (
    <>
      <Section n="1" title="Responsable del tratamiento">
        <p>
          Red Cobalto, plataforma operada desde Colombia, es la responsable del tratamiento
          de los datos personales que recogemos a través de{' '}
          <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>redcobalto.com</span>.
        </p>
        <p>
          Canal de atención al titular:{' '}
          <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>{LEGAL_EMAIL}</span>
        </p>
      </Section>

      <Section n="2" title="Qué datos recogemos">
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Datos que nos das al registrarte:</p>
        <Bullets items={[
          'Nombre completo.',
          'Número de celular.',
          'Opcionalmente: correo electrónico, empresa, ciudad y foto de perfil.',
        ]} />
        <p className="font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>Datos que se generan al usar la plataforma:</p>
        <Bullets items={[
          'Tus publicaciones, comentarios y reacciones.',
          'Los mensajes que envías por la mensajería interna.',
          'Registros técnicos básicos necesarios para operar el servicio y protegerlo de abusos.',
        ]} />
      </Section>

      <Section n="3" title="Qué es público y qué es privado">
        <p>
          Esta distinción es central en cómo está construida la plataforma, y se aplica en
          la propia base de datos, no solo en la pantalla:
        </p>
        <div className="rounded-card p-5 mt-1"
          style={{ background: 'var(--accent-softer)', border: '1px solid var(--accent-soft)' }}>
          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Visible para otros miembros
          </p>
          <p className="text-[14px]">Tu nombre, ciudad, empresa, foto de perfil y el contenido que publicas.</p>

          <p className="font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>
            Nunca visible para otros miembros
          </p>
          <p className="text-[14px]">
            Tu número de celular y tu correo electrónico. Se almacenan en una tabla
            separada a la que solo pueden acceder tu propia cuenta y la administración de
            la plataforma.
          </p>
        </div>
      </Section>

      <Section n="4" title="Para qué usamos tus datos">
        <Bullets items={[
          'Crear y mantener tu cuenta, y verificar tu identidad al ingresar.',
          'Mostrar tu perfil y tus publicaciones a otros miembros de la comunidad.',
          'Permitir que otros miembros te contacten por la mensajería interna.',
          'Enviarte avisos relacionados con tu actividad en la plataforma.',
          'Moderar contenido, atender reportes y prevenir fraudes o abusos.',
          'Elaborar estadísticas agregadas de la comunidad, que no identifican a ninguna persona.',
        ]} />
      </Section>

      <Section n="5" title="Con quién se comparten">
        <p>
          No vendemos tus datos personales ni los entregamos a terceros con fines
          publicitarios.
        </p>
        <p>
          Utilizamos proveedores de tecnología que procesan datos por nuestra cuenta y bajo
          nuestras instrucciones, únicamente para que el servicio funcione: alojamiento de
          la aplicación, base de datos y almacenamiento de archivos. Estos proveedores
          pueden operar servidores fuera de Colombia, lo que implica una transferencia
          internacional de datos amparada en tu autorización y en las garantías de
          seguridad que exigen a sus clientes.
        </p>
        <p>
          También podremos entregar información cuando lo exija una autoridad competente
          mediante orden legal.
        </p>
      </Section>

      <Section n="6" title="Tus derechos como titular (Ley 1581 de 2012)">
        <p>
          La ley colombiana de protección de datos personales, conocida como Habeas Data,
          te reconoce estos derechos:
        </p>
        <Bullets items={[
          'Conocer qué datos tuyos tenemos y cómo los usamos.',
          'Actualizar y rectificar los datos que estén incompletos o desactualizados.',
          'Solicitar la supresión de tus datos cuando no exista un deber legal de conservarlos.',
          'Revocar la autorización que nos diste para tratarlos.',
          'Solicitar prueba de la autorización que otorgaste.',
          'Presentar quejas ante la Superintendencia de Industria y Comercio.',
        ]} />
        <p className="mt-2">
          Puedes ejercer cualquiera de estos derechos escribiendo a{' '}
          <span className="font-semibold" style={{ color: 'var(--accent-deep)' }}>{LEGAL_EMAIL}</span>.
          Las consultas se atienden en un máximo de diez (10) días hábiles y los reclamos
          en un máximo de quince (15) días hábiles, conforme a los plazos legales.
        </p>
        <p>
          Buena parte de estos derechos también los puedes ejercer directamente desde la
          aplicación: editar tu perfil, eliminar tus publicaciones o solicitar la baja de
          tu cuenta.
        </p>
      </Section>

      <Section n="7" title="Cuánto tiempo conservamos tus datos">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Si solicitas su
          eliminación, los borramos salvo aquellos que debamos conservar por una obligación
          legal o para atender una controversia en curso.
        </p>
        <p>
          Ten en cuenta que los mensajes que enviaste a otros usuarios permanecen visibles
          para ellos, del mismo modo que un correo enviado permanece en la bandeja de quien
          lo recibió.
        </p>
      </Section>

      <Section n="8" title="Seguridad">
        <p>
          Aplicamos medidas técnicas para proteger tu información, incluidas reglas de
          acceso a nivel de base de datos que impiden que un usuario consulte datos
          privados de otro, cifrado del tráfico y control de permisos para las funciones de
          administración.
        </p>
        <p>
          Ningún sistema es completamente infalible. Si detectamos un incidente que afecte
          tus datos personales, lo informaremos conforme a la normativa vigente.
        </p>
      </Section>

      <Section n="9" title="Menores de edad">
        <p>
          La plataforma está dirigida a profesionales del sector y no está destinada a
          menores de 18 años. Si detectamos una cuenta de un menor, la eliminaremos.
        </p>
      </Section>

      <Section n="10" title="Cambios a esta política">
        <p>
          Si modificamos esta política, publicaremos la nueva versión en esta página con su
          fecha de actualización, y avisaremos dentro de la plataforma cuando el cambio sea
          sustancial.
        </p>
      </Section>
    </>
  )
}
