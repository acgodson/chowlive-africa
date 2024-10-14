const ListenerPanel = () => {
  // const roomInformation = useRecoilValue(roomInformationState);
  // const [listeners, setListeners] = useState<
  //   UserInformationRoom[] | undefined
  // >();

  // const [value, loading, error] = useDocument(
  //   roomInformation
  //     ? firebase
  //         .firestore()
  //         .collection('rooms')
  //         .doc(roomInformation.id)
  //         .collection('details')
  //         .doc('listeners')
  //     : null
  // );

  // useEffect(() => {
  //   if (!loading && !error && value) {
  //     if (value.exists) {
  //       const document = value.data() as ListenersDocument;
  //       setListeners(Object.values(document.listeners));
  //     }
  //   }
  // }, [value, loading, error, roomInformation]);

  return (
    <div className='flex flex-col'>
      {/* {listeners ? (
        listeners.map((listener) => <ListenerDisplay user={listener} />)
      ) : (
        <Spinner />
      )} */}
    </div>
  );
};

export default ListenerPanel;
